import JobBase from "jobs/JobBase";

export default abstract class CreepRole
{
	readonly roleName: string;
	constructor(roleName: string)
	{
		this.roleName = roleName;
	}

	abstract initMemory(): CreepMemory;
	abstract run(creep?: Creep, structure?: Structure): void;
	abstract canAcceptJob(creep: JobAssignable, job: JobBase): boolean;
	abstract generateBody(energyBudget: number): BodyPartConstant[];
}