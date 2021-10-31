import {ErrorMapper} from "utils/ErrorMapper";
import RoleIndex from "roles/RoleIndex";
import ChargeStructureJob from "jobs/ChargeStructureJob";
import JobQueue from "jobs/JobQueue";
import CreepRosterMeta from "types/CreepRosterMeta";
import JobBase from "jobs/JobBase";
import {isJobAssignable, log, LogLevel, setLogLevel} from "utils/misc";
import UpgradeControllerJob from "jobs/UpgradeControllerJob";
import ConstructBuildingJob from "jobs/ConstructBuildingJob";
import watcher from "screeps-multimeter/lib/watch-client";
import MapIntel, {RoomIntel} from "organization/MapIntel";
import BuildingPlanner from "organization/BuildingPlanner";

type BasicVoidFuncType = ()=> void;
declare global
{
	interface JobAssignableMemory
	{
		role: string;
		assignedJob: Id<JobBase> | null | undefined;
	}
	interface CreepMemory extends JobAssignableMemory{}
	interface SpawnMemory extends JobAssignableMemory{}
	interface Structure
	{
		my: boolean | undefined;
	}
	interface JobAssignable
	{
		name: string;
		memory: JobAssignableMemory;
	}
	interface StructureWithStore extends Structure
	{
		store: Store<RESOURCE_ENERGY, false>;
	}
	interface StructureSpawn extends JobAssignable {}
	interface RoomMemory extends RoomIntel {}
	namespace NodeJS
	{
		interface Global
		{
			killAllCreeps: BasicVoidFuncType;
			jobQueue: JobQueue;
			roleIndex: RoleIndex;
			creepRosterMeta: CreepRosterMeta;
			runOnRole: any;
			pingRole: any;
			setLogLevel: any;
			getStatusLine: any;
			forgetAllRooms: any;
		}
	}
}

global.setLogLevel = setLogLevel;

global.killAllCreeps = function()
{
	for(const name in Game.creeps)
	{
		Game.creeps[name].suicide();
		delete Game.creeps[name];
	}
}

global.runOnRole = function(roleName: string, callback: any)
{
	for(const name in Game.creeps)
	{
		const creep = Game.creeps[name];
		/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
		if(creep.memory.role === roleName){callback(creep);}
	}
}

global.pingRole = function(roleName: string)
{
	/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
	global.runOnRole(roleName, (c: Creep)=>c.say("Here!"));
}

global.forgetAllRooms = function()
{
	for(const roomName in Memory.rooms){delete Memory.rooms[roomName];}
	Memory.rooms = {};
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
global.getStatusLine = function(): string
{
	/* eslint-disable @typescript-eslint/restrict-template-expressions */
	/* eslint-disable @typescript-eslint/restrict-plus-operands */
	const roleText = `x${global.creepRosterMeta?.total} ${global.roleIndex.roleNames.map((roleName: string)=>`${roleName}:${global.creepRosterMeta?.getTotal(roleName)}`).filter((text: string)=>!text.endsWith(":0")).join(" ")}`
	const jobQueueTallies: any = {}
	jobQueue.fillableJobs.forEach((job)=>{jobQueueTallies[job.jobName] = (jobQueueTallies[job.jobName] || 0) + (job.maxAssigned - job.assigned.length);});
	const jobQueueText = `x${jobQueue.fillableJobs.length} ${Object.keys(jobQueueTallies).map((jobName: string)=>`${jobName}:${jobQueueTallies[jobName]}`).join(" ")}`;
	return `POP:${roleText} JOBS:${jobQueueText}`;
	/* eslint-enable */
}

log(LogLevel.EVENT, "SYSTEM", "INIT COMPLETE");

export const loop = ErrorMapper.wrapLoop(() =>
{
	const defaultRoom = Game.spawns.Spawn1.room;

	const creepRosterMeta = new CreepRosterMeta();
	global.creepRosterMeta = creepRosterMeta;
	jobQueue.run();
	const fillableJobs = jobQueue.fillableJobs;
	for(const name in Memory.creeps)
	{
		if(!(name in Game.creeps))
		{
			const memory = Memory.creeps[name];
			log(LogLevel.EVENT, "DEAD", "Creep died...", {name, memory} as JobAssignable);
			delete Memory.creeps[name];
			continue;
		}
	}

	for(const name in Game.creeps)
	{
		const creep = Game.creeps[name];
		const memory = creep.memory;
		const role = roleIndex.getRole(memory.role);
		fillableJobs.filter((nextJob) => !jobQueue.attemptFillJob(creep, nextJob));
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
			fillableJobs.filter((nextJob) => !jobQueue.attemptFillJob(assignableStructure, nextJob));
			role.run(structure);
		}
		switch(structure.structureType)
		{
			case STRUCTURE_SPAWN:
			case STRUCTURE_TOWER:
			case STRUCTURE_EXTENSION:
			{
				const spawn = structure as StructureWithStore;
				if(spawn.my && ChargeStructureJob.isJobNeeded(spawn))
				{
					const fillJob = new ChargeStructureJob(spawn);
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

	MapIntel.run();
	BuildingPlanner.run();

	for(const name in Game.constructionSites)
	{
		const site = Game.constructionSites[name];
		const constructJob = new ConstructBuildingJob(site);
		jobQueue.addJob(constructJob);
	}

	watcher(); /* eslint-disable-line */
});