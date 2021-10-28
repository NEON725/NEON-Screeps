import JobBase from "jobs/JobBase";
import SendGiftJob from "jobs/SendGiftJob";
import MapIntel, {RoomAllocation} from "organization/MapIntel";
import CreepMemoryBase from "types/CreepMemoryBase";
import {isExit, log, LogLevel, moveTo} from "utils/misc";
import CreepRole from "./CreepRole";

class MuleIntent
{
	constructor(public harvesting: boolean, public travelTarget: RoomPosition | null = null, public target: Id<Structure> | Id<ConstructionSite> | Id<Source> | null = null){}
}
export class MuleMemory extends CreepMemoryBase
{
	homeRoom: string | null = null;
	intent: MuleIntent = new MuleIntent(true);
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
		const room = creep.room;
		const memory = creep.memory as MuleMemory;
		if(!memory.homeRoom){memory.homeRoom = room.name;}
		const store = creep.store;
		if(store.getUsedCapacity(RESOURCE_ENERGY) === 0 && !memory.intent.harvesting)
		{
			memory.intent.harvesting = true;
			memory.intent.target = null;
			memory.intent.travelTarget = null;
		}
		else if(store.getFreeCapacity(RESOURCE_ENERGY) === 0 && memory.intent.harvesting)
		{
			memory.intent.harvesting = false;
			memory.intent.target = null;
			memory.intent.travelTarget = null;
		}
		if(job && memory.intent.harvesting){job.unassignJob(creep);}
		if(memory.intent.target)
		{
			const target = Game.getObjectById(memory.intent.target) as
				{pos: RoomPosition, structureType: Id<StructureConstant> | Id<ConstructionSite> | Id<ConstructionSite> | undefined} | null;
			if(target)
			{
				memory.intent.travelTarget = target.pos;
				let result: number;
				if(memory.intent.harvesting){result = creep.harvest(target as unknown as Source);}
				else
				{
					result = creep.build(target as unknown as ConstructionSite);
					if(result === ERR_INVALID_TARGET)
					{
						switch(target.structureType)
						{
							case STRUCTURE_STORAGE:
							case STRUCTURE_CONTAINER:
							case STRUCTURE_EXTENSION:
							case STRUCTURE_CONTROLLER:
								result = creep.transfer(target as unknown as Structure, RESOURCE_ENERGY);
								break;
							default:
								break;
						}
					}
				}
				if(result === ERR_NOT_IN_RANGE){moveTo(creep, target);}
				else if(result !== OK){memory.intent.target = null;}
			}
			else if(memory.intent.travelTarget && room.name !== memory.intent.travelTarget.roomName)
			{
				moveTo(creep, memory.intent.travelTarget);
			}
			else
			{
				memory.intent.target = null;
				log(LogLevel.WALL, "STORING", "Lost target.", creep);
			}
		}
		else if(memory.intent.travelTarget)
		{
			if(memory.intent.travelTarget.roomName !== room.name || isExit(creep.pos))
			{
				const result = moveTo(creep, memory.intent.travelTarget);
				if(result === ERR_NO_PATH)
				{
					memory.intent.travelTarget = new RoomPosition(_.random(49), _.random(49), memory.intent.travelTarget.roomName);
				}
			}
			else if(memory.intent.harvesting)
			{
				const sources = creep.room.find(FIND_SOURCES_ACTIVE);
				const source = sources[Math.floor(Math.random() * sources.length)];
				if(source)
				{
					memory.intent.travelTarget = null;
					memory.intent.target = source.id;
				}
			}
			else
			{
				let loggableName = "unknown";
				const validStorageFunc = (structure: Structure)=>
					([STRUCTURE_EXTENSION, STRUCTURE_STORAGE, STRUCTURE_CONTAINER] as string[]).includes(structure.structureType)
					&& (structure as StructureExtension | StructureStorage | StructureContainer).store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				const storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: validStorageFunc});
				if(storage)
				{
					memory.intent.target = storage.id;
					memory.intent.travelTarget = null;
					loggableName = "storage";
				}
				else
				{
					const validConstructionSiteFunc = (site: ConstructionSite)=>
						([STRUCTURE_EXTENSION, STRUCTURE_STORAGE, STRUCTURE_CONTAINER] as BuildableStructureConstant[])
							.includes(site.structureType);
					const site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: validConstructionSiteFunc});
					if(site)
					{
						memory.intent.target = site.id;
						memory.intent.travelTarget = null;
						loggableName = `construction:${site.structureType}`;
					}
					else
					{
						const controller = room.controller;
						if(controller)
						{
							memory.intent.target = controller.id;
							memory.intent.travelTarget = null;
							loggableName = "controller";
						}
					}
				}
				log(LogLevel.WALL, "MINING", `Returning energy to ${loggableName}:${room.name}:${memory.intent.target as string}`, creep)
			}
		}
		else if(memory.intent.harvesting)
		{
			const targetRoomName = MapIntel.findNearestRoomByType(memory.homeRoom, RoomAllocation.NEUTRAL);
			if(targetRoomName)
			{
				memory.intent.travelTarget = new RoomPosition(25, 25, targetRoomName);
				log(LogLevel.WALL, "MINING", `Gathering resources from ${targetRoomName}`, creep);
			}
		}
		else
		{
			memory.intent.travelTarget = new RoomPosition(25, 25, memory.homeRoom);
		}
		if(job)
		{
			const jobRoom = Game.rooms[job.roomName];
			if(jobRoom)
			{
				const roomTargets = jobRoom.find(FIND_HOSTILE_SPAWNS);
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
		return job.jobName === "SendGift" && (creep.memory as MuleMemory).intent?.harvesting === false;
	}

	generateBody(energyBudget: number): BodyPartConstant[]
	{
		const retVal: BodyPartConstant[] = [WORK, MOVE];
		let remainingBudget = energyBudget;
		for(const part of retVal){remainingBudget -= BODYPART_COST[part];}
		const carryCost = BODYPART_COST[CARRY];
		for(let i = 0; i < Math.floor(remainingBudget / carryCost); i++)
		{
			retVal.unshift(CARRY);
		}
		return retVal;
	}
}