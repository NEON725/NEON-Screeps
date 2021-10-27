import RoleIndex from "roles/RoleIndex";
import CreepMemoryBase from "types/CreepMemoryBase";
import {generateRandomName} from "utils/misc";
import JobBase from "./JobBase";
import JobPriority from "./JobPriority";

export default class SpawnCreepJob extends JobBase
{
	completed = false;
	initialMemory: CreepMemoryBase;
	body: BodyPartConstant[];
	constructor(public roleName: string, atom: string, priority: JobPriority, budget: number)
	{
		super("SpawnCreep", {atom, priority});
		const role = global.roleIndex.getRole(roleName);
		this.initialMemory = role.initMemory();
		this.body = role.generateBody(budget);
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