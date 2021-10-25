import {ErrorMapper} from "utils/ErrorMapper";
import RoleIndex from "roles/RoleIndex";
import FillSpawnerJob from "jobs/FillSpawnerJob";
import JobQueue from "jobs/JobQueue";
import CreepRosterMeta from "types/CreepRosterMeta";
import JobBase from "jobs/JobBase";
import {isJobAssignable} from "utils/misc";
import UpgradeControllerJob from "jobs/UpgradeControllerJob";
import SpawnCreepJob from "jobs/SpawnCreepJob";
import ConstructBuildingJob from "jobs/ConstructBuildingJob";

type BasicVoidFuncType = ()=> void;
declare global
{
	interface JobAssignableMemory
	{
		role: string;
		assignedJob: Id<JobBase> | null | undefined;
	}
	interface CreepMemory extends JobAssignableMemory
	{
	}
	interface SpawnMemory extends JobAssignableMemory
	{
	}
	interface Structure
	{
		my: boolean | undefined;
	}
	interface JobAssignable
	{
		name: string;
		memory: JobAssignableMemory;
	}
	interface StructureSpawn extends JobAssignable
	{
	}
	namespace NodeJS
	{
		interface Global
		{
			killAllCreeps: BasicVoidFuncType;
			jobQueue: JobQueue;
			roleIndex: RoleIndex;
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

for(const name in Game.creeps)
{
	const creep = Game.creeps[name];
	const memory = creep?.memory;
	if(memory?.assignedJob)
	{
		memory.assignedJob = null;
	}
}
for(const name in Game.structures)
{
	const structure = Game.structures[name];
	if(isJobAssignable(structure))
	{
		const memory = (structure as unknown as JobAssignable).memory;
		if(memory?.assignedJob)
		{
			memory.assignedJob = null;
		}
	}
}

const jobQueue = new JobQueue();
global.jobQueue = jobQueue;
const roleIndex = new RoleIndex();
global.roleIndex = roleIndex;

console.log("NEON - INIT COMPLETE");

export const loop = ErrorMapper.wrapLoop(() =>
{
	const defaultRoom = Game.rooms[Object.keys(Game.rooms)[0]];

	const creepRosterMeta = new CreepRosterMeta();
	jobQueue.run();
	const fillableJobs = jobQueue.fillableJobs;
	for(const name in Memory.creeps)
	{
		if(!(name in Game.creeps))
		{
			delete Memory.creeps[name];
			continue;
		}
	}

	for(const name in Game.creeps)
	{
		const creep = Game.creeps[name];
		const memory = creep.memory;
		const role = roleIndex.getRole(memory.role);
		fillableJobs.filter((nextJob)=>!jobQueue.attemptFillJob(creep, nextJob));
		role.run(creep);
		creepRosterMeta.tallyCreep(creep);
	}

	const spawnJob = creepRosterMeta.generateSpawnJob(defaultRoom.energyCapacityAvailable, 1);
	if(spawnJob){jobQueue.addJob(spawnJob);}

	for(const name in Game.structures)
	{
		const structure = Game.structures[name];
		if(structure.my && isJobAssignable(structure))
		{
			const assignableStructure = (structure as unknown) as JobAssignable;
			const role = roleIndex.getRole(assignableStructure);
			fillableJobs.filter((nextJob)=>!jobQueue.attemptFillJob(assignableStructure, nextJob));
			role.run(undefined, structure);
		}
		switch(structure.structureType)
		{
			case STRUCTURE_SPAWN:
			{
				const spawn = structure as StructureSpawn;
				if(spawn.my && FillSpawnerJob.isJobNeeded(spawn))
				{
					const fillJob = new FillSpawnerJob(spawn);
					jobQueue.addJob(fillJob);
				}
				break;
			}
			case STRUCTURE_CONTROLLER:
			{
				const controller = structure as StructureController;
				if(controller.my && UpgradeControllerJob.isJobNeeded(controller))
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

	for(const name in Game.constructionSites)
	{
		const site = Game.constructionSites[name];
		const constructJob = new ConstructBuildingJob(site);
		jobQueue.addJob(constructJob);
	}
});