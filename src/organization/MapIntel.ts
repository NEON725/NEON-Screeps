import {log, LogLevel} from "utils/misc";

export enum RoomAllocation
{ /* eslint-disable-line */
	NEUTRAL,
	HOSTILE,
	MILITARY,
	INDUSTRIAL,
	DIPLOMATIC,
}

export class RoomIntel
{
	allocation: RoomAllocation | undefined = undefined;
}

export default class MapIntel
{
	static run(): void
	{
		for(const roomName in Game.rooms)
		{
			const room = Game.rooms[roomName];
			const memory = room.memory;
			const allocation = MapIntel.calculateRoomAllocation(room);
			if(memory.allocation !== undefined && memory.allocation !== allocation)
			{
				log(LogLevel.EVENT, "MAP", `Room ${roomName} has been reclassified as ${RoomAllocation[allocation]}`);
			}
			if(memory.allocation === undefined)
			{
				const myCreeps = room.find(FIND_MY_CREEPS);
				const myCreep = myCreeps.length === 1 ? myCreeps[0] : undefined;
				log(LogLevel.EVENT, "MAP", `Discovered ${roomName} (${RoomAllocation[allocation]})!`, myCreep);
			}
			memory.allocation = allocation;
			const events = room.getEventLog();
			events.forEach((eventRaw: any)=>
			{
				switch(eventRaw.event)
				{
					case EVENT_ATTACK:
						{
							log(LogLevel.WALL, "COMBAT", JSON.stringify(eventRaw));
							const event = eventRaw as EventData[EVENT_ATTACK];
							const id = event.targetId as Id<RoomObject>;
							const target = Game.getObjectById(id);
							if(target !== null && "my" in target && (target as Creep).my)
							{
								log(LogLevel.DANGER, "COMBAT", `Took ${event.damage} damage!`, target as Creep);
							}
						}
						break;
					default:
						break;
				}
			});
		}
	}

	static calculateRoomAllocation(room: Room): RoomAllocation
	{
		const controller = room.controller;
		if(!controller || !controller.owner){return RoomAllocation.NEUTRAL;}
		if(controller.my)
		{
			if(room.memory.allocation){return room.memory.allocation;}
			else
			{
				const spawns = room.find(FIND_MY_SPAWNS);
				if(spawns.length > 0){return RoomAllocation.INDUSTRIAL;}
				else{return RoomAllocation.MILITARY;}
			}
		}
		const owner = controller.owner;
		if(owner.username === "DingusKhan"){return RoomAllocation.DIPLOMATIC;}
		return RoomAllocation.HOSTILE;
	}
}