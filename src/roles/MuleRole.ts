import JobBase from "jobs/JobBase";
import SendGiftJob from "jobs/SendGiftJob";
import CreepMemoryBase from "types/CreepMemoryBase";
import {moveTo} from "utils/misc";
import CreepRole from "./CreepRole";

export class MuleMemory extends CreepMemoryBase
{
	harvesting = true;
}

export default class MuleRole extends CreepRole
{
	constructor()
	{
		super("Mule");
	}

	initMemory(): CreepMemory
	{
		return new MuleMemory(this.roleName);
	}

	run(creep: Creep): void
	{
		const job = global.jobQueue.getJobById(creep?.memory.assignedJob) as SendGiftJob | undefined;
		const memory = creep.memory as MuleMemory;
		const store = creep.store;
		if(store.getFreeCapacity(RESOURCE_ENERGY) === 0){memory.harvesting = false;}
		else if(store.getUsedCapacity(RESOURCE_ENERGY) === 0)
		{
			memory.harvesting = true;
			if(job){job.unassignJob(creep);}
		}
		if(memory.harvesting)
		{
			const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
			if(source !== null && creep.harvest(source) === ERR_NOT_IN_RANGE)
			{
				moveTo(creep, source);
			}
		}
		else if(job)
		{
			const room = Game.rooms[job.roomName];
			if(room)
			{
				const roomTargets = room.find(FIND_HOSTILE_SPAWNS);
				if(roomTargets.length > 0)
				{

					const target = roomTargets[0];
					const result = creep.transfer(target, RESOURCE_ENERGY);
					if(result === ERR_NOT_IN_RANGE || result === ERR_TIRED || result === ERR_FULL){moveTo(creep, roomTargets[0]);}
					else{job.unassignJob(creep);}
				}
			}
			else
			{
				moveTo(creep, new RoomPosition(25, 25, job.roomName));
				const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
				enemies.forEach((enemy: Creep) => creep.attack(enemy));
			}
		}
	}

	canAcceptJob(creep: JobAssignable, job: JobBase): boolean
	{
		return job.jobName === "SendGift" && (creep.memory as MuleMemory).harvesting === false;
	}

	generateBody(energyBudget: number): BodyPartConstant[]
	{
		const retVal: BodyPartConstant[] = [WORK, MOVE, MOVE, CARRY];
		let remainingBudget = energyBudget;
		for(const part of retVal){remainingBudget -= BODYPART_COST[part];}
		const carryCost = BODYPART_COST[TOUGH];
		for(let i = 0; i < Math.floor(remainingBudget / carryCost); i++)
		{
			retVal.unshift(TOUGH);
		}
		return retVal;
	}
}