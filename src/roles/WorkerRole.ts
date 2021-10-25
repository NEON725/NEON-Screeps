import FillSpawnerJob from "jobs/FillSpawnerJob";
import JobBase from "jobs/JobBase";
import UpgradeControllerJob from "jobs/UpgradeControllerJob";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "roles/CreepRole";
import {moveTo, randomDirection} from "utils/misc";
import ConstructBuildingJob from "jobs/ConstructBuildingJob";

export class WorkerMemory extends CreepMemoryBase
{
	harvesting = true;
}

const ACCEPTABLE_JOBS = ["FillSpawner", "UpgradeController", "ConstructBuilding"];

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
					moveTo(creep, source);
				}
			}
		}
		else if(carry.energy === 0 || (carry.getFreeCapacity(RESOURCE_ENERGY) > 0 && jobId === null)){memory.harvesting = true;}
		else
		{
			const job = global.jobQueue.getJobById(jobId);
			let result: number;
			let targetPos: RoomPosition | undefined;
			switch(job?.jobName)
			{
				case "FillSpawner":
					{
						const fillJob = job as FillSpawnerJob;
						const structure = Game.getObjectById(fillJob.spawnId) as StructureSpawn;
						result = creep.transfer(structure, RESOURCE_ENERGY);
						targetPos = structure.pos;
					}
					break;
				case "UpgradeController":
					{
						const upgradeJob = job as UpgradeControllerJob;
						const structure = Game.getObjectById(upgradeJob.controllerId) as StructureController;
						result = creep.upgradeController(structure);
						targetPos = structure.pos;
					}
					break;
				case "ConstructBuilding":
					{
						const constructJob = job as ConstructBuildingJob;
						const structure = Game.getObjectById(constructJob.constructionSiteId) as ConstructionSite;
						result = creep.build(structure);
						targetPos = structure.pos;
					}
					break;
				default:
					result = creep.move(randomDirection());
					break;
			}
			this.handlePostOperation(creep, job, result, targetPos);
		}
	}

	handlePostOperation(self: Creep, job: JobBase | null, opResult: number, targetPos?: RoomPosition): void
	{
		const carry = self.store;
		const memory = self.memory as WorkerMemory;
		switch(opResult)
		{
			case ERR_NOT_IN_RANGE:
				if(targetPos)
				{
					moveTo(self, targetPos, {visualizePathStyle: {}});
				}
				break;
			case ERR_FULL:
				if(job)
				{
					if(carry.getFreeCapacity() > 0){memory.harvesting = true;}
					job.unassignJob(self);
				}
				break;
			case OK:
			case ERR_TIRED:
				break;
			default:
			{
				const jobText = job ? job.toString() : "none";
				throw new Error(`Unknown result: job:${jobText} ${opResult}`);
			}
		}
	}

	canAcceptJob(creep: JobAssignable, job: JobBase): boolean
	{
		return !(creep.memory as WorkerMemory).harvesting && (ACCEPTABLE_JOBS.includes(job.jobName));
	}

	generateBody(energyBudget: number): BodyPartConstant[]
	{
		let remainingBudget = energyBudget;
		const retVal: BodyPartConstant[] = [];
		while(true)
		{
			for(const part of[WORK, MOVE, CARRY])
			{
				const cost = BODYPART_COST[part];
				if(cost > remainingBudget){return retVal;}
				remainingBudget -= cost;
				retVal.push(part);
			}
		}
	}
}