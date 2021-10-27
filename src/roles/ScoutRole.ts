import JobBase from "jobs/JobBase";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "./CreepRole";

export class ScoutMemory extends CreepMemoryBase
{
	targetRoomName: string | undefined;
}
export default class ScoutRole extends CreepRole
{
	constructor()
	{
		super("Scout");
	}

	initMemory(): CreepMemory
	{
		return new ScoutMemory(this.roleName);
	}

	run(creep: Creep): void
	{
		const memory = creep.memory as ScoutMemory;
		const target = memory.targetRoomName;
		const currentRoom = creep.room.name;
		if(!target || currentRoom === target)
		{
			const exits = Game.map.describeExits(currentRoom);
			const directions = Object.keys(exits) as ExitKey[];
			const rand = Math.floor(Math.random() * directions.length);
			const chosenDirection = directions[rand];
			memory.targetRoomName = exits[chosenDirection];
		}
		else
		{
			creep.moveTo(new RoomPosition(25, 25, target));
		}
	}

	canAcceptJob(creep: JobAssignable, job: JobBase): boolean
	{
		return false;
	}

	generateBody(energyBudget: number): BodyPartConstant[]
	{
		return [MOVE];
	}

}