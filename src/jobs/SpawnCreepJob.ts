import CreepMemoryBase from "types/CreepMemoryBase";
import {log, LogLevel} from "utils/misc";
import JobBase from "./JobBase";
import JobPriority from "./JobPriority";

export default class SpawnCreepJob extends JobBase
{
	completed = false;
	initialMemory: CreepMemoryBase;
	body: BodyPartConstant[];
	name: string | undefined;
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
		const creep: Creep | undefined = Game.creeps[this.name || ""];
		log(LogLevel.EVENT, "SPAWN", "Creep born!", creep);
	}

	toString(): string
	{
		return `${super.toString()}:${this.initialMemory.role}`;
	}
}