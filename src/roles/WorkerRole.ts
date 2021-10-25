import FillSpawnerJob from "jobs/FillSpawnerJob";
import JobBase from "jobs/JobBase";
import UpgradeControllerJob from "jobs/UpgradeControllerJob";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "roles/CreepRole";
import {randomDirection} from "utils/misc";

export class WorkerMemory extends CreepMemoryBase
{
	harvesting = true;
}

const ACCEPTABLE_JOBS = ["FillSpawner", "UpgradeController"];

export default class WorkerRole extends CreepRole
{
	constructor()
	{
		super("Worker");
	}

	initMemory(): CreepMemory
	{
		return new WorkerMemory(this.roleName);
	}

	run(creep: Creep): void
	{
		super.run(creep);
		const memory = creep.memory as WorkerMemory;
		const jobId = memory.assignedJob;
		const carry = creep.store;
		if(memory.harvesting)
		{
			const job = global.jobQueue.getJobById(jobId);
			if(job){job.unassignJob(creep);}
			if(carry.getFreeCapacity() === 0) { memory.harvesting = false; }
			else
			{
				const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
				if(source !== null && creep.harvest(source) === ERR_NOT_IN_RANGE)
				{
					creep.moveTo(source);
				}
			}
		}
		else if(carry.energy === 0 || (carry.getFreeCapacity(RESOURCE_ENERGY) > 0 && jobId === null)){memory.harvesting = true;}
		else
		{
			const job = global.jobQueue.getJobById(jobId);
			switch(job?.jobName)
			{
				case "FillSpawner":
				case "UpgradeController":
				{
					let structure: Structure;
					let result;
					switch(job.jobName)
					{
						case "FillSpawner":
							{
								const fillJob = job as FillSpawnerJob;
								structure = Game.getObjectById(fillJob.spawnId) as Structure;
								result = creep.transfer(structure as StructureSpawn, RESOURCE_ENERGY);
							}
							break;
						case "UpgradeController":
							{
								const upgradeJob = job as UpgradeControllerJob;
								structure = Game.getObjectById(upgradeJob.controllerId) as Structure;
								result = creep.upgradeController(structure as StructureController);
							}
							break;
					}
					switch(result)
					{
						case ERR_NOT_IN_RANGE:
						{
							creep.moveTo(structure);
							break;
						}
						case ERR_FULL:
						{
							if(carry.getFreeCapacity() > 0){memory.harvesting = true;}
							job.unassignJob(creep);
							break;
						}
						case OK:
							break;
						default:
							throw new Error(`Unknown result: job:${job.jobName} ${result}`);
					}
					if(result === ERR_NOT_IN_RANGE){creep.moveTo(structure);}
					break;
				}
				default:
					creep.move(randomDirection());
					break;
			}
		}
	}

	canAcceptJob(creep: JobAssignable, job: JobBase): boolean
	{
		return !(creep.memory as WorkerMemory).harvesting && (ACCEPTABLE_JOBS.includes(job.jobName));
	}
}