import RoleIndex from "roles/RoleIndex";
import CreepMemoryBase from "types/CreepMemoryBase";
import {generateRandomName} from "utils/misc";
import JobBase from "./JobBase";

export default class SpawnCreepJob extends JobBase
{
	completed = false;
	initialMemory: CreepMemoryBase;
	name = generateRandomName();
	body: BodyPartConstant[] = [WORK, CARRY, MOVE];
	constructor(public role: string, atom: string)
	{
		super(`SpawnCreep: ${role}`, {atom});
		this.initialMemory = global.roleIndex.getRole(role).initMemory();
	}

	run(): boolean
	{
		return !this.completed;
	}

	reportCompletedScreep(): void
	{
		this.completed = true;
	}
}