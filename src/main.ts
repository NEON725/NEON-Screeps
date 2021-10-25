import {ErrorMapper} from "utils/ErrorMapper";
import RoleIndex from "roles/RoleIndex";
import FillSpawnerJob from "jobs/FillSpawnerJob";
import JobQueue from "jobs/JobQueue";
import CreepRosterMeta from "types/CreepRosterMeta";
import JobBase from "jobs/JobBase";
import {spawnCreep} from "utils/misc";
import UpgradeControllerJob from "jobs/UpgradeControllerJob";

type BasicVoidFuncType = ()=> void;
declare global
{
	interface CreepMemory
	{
		role: string;
		assignedJob: Id<JobBase> | null;
	}
	namespace NodeJS
	{
		interface Global
		{
			jobQueue: JobQueue;
			killAllCreeps: BasicVoidFuncType;
		}
	}
}

global.killAllCreeps = function()
{
	for(const name in Game.creeps)
	{
		Game.creeps[name].suicide();
		delete Game.creeps[name];
	}
}

const roleIndex = new RoleIndex();
let creepRosterMeta = new CreepRosterMeta();

for(const name in Memory.creeps)
{
	const creep = Game.creeps[name];
	const memory = creep?.memory;
	if(memory?.assignedJob)
	{
		memory.assignedJob = null;
	}
}

const jobQueue = new JobQueue();
global.jobQueue = jobQueue;

console.log("NEON - INIT COMPLETE");

export const loop = ErrorMapper.wrapLoop(() =>
{
	console.log(`RUN: ${Game.time}`);
	const nextCreepRosterMeta = new CreepRosterMeta();
	jobQueue.run();
	let nextFillableJob = jobQueue.getNextFillableJob();
	for(const name in Memory.creeps)
	{
		if(!(name in Game.creeps))
		{
			delete Memory.creeps[name];
			continue;
		}
		const creep = Game.creeps[name];
		const memory = creep.memory;
		const role = roleIndex.getRole(memory.role);
		if(nextFillableJob != null && !memory.assignedJob && role.canAcceptJob(creep, nextFillableJob))
		{
			nextFillableJob.assignJob(creep);
			nextFillableJob = null;
		}
		role.run(creep);
		nextCreepRosterMeta.total++;
	}
	creepRosterMeta = nextCreepRosterMeta;
	for(const name in Game.structures)
	{
		const structure = Game.structures[name];
		switch(structure.structureType)
		{
			case STRUCTURE_SPAWN:
			{
				const spawn = structure as StructureSpawn;
				if(FillSpawnerJob.isJobNeeded(spawn))
				{
					const fillJob = new FillSpawnerJob(spawn);
					jobQueue.addJob(fillJob);
				}
				break;
			}
			case STRUCTURE_CONTROLLER:
			{
				const controller = structure as StructureController;
				if(UpgradeControllerJob.isJobNeeded(controller))
				{
					const upgradeJob = new UpgradeControllerJob(controller);
					jobQueue.addJob(upgradeJob);
				}
				break;
			}
			default:
				break;
		}
	}
	const mainSpawn = Game.spawns.Spawn1;
	if(mainSpawn.store.energy >= 200 && creepRosterMeta.total < 30)
	{
		spawnCreep(mainSpawn, roleIndex.getRole("worker"));
	}
});