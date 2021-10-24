export default abstract class CreepRole
{
	readonly roleName: string;
	constructor(roleName: string)
	{
		this.roleName = roleName;
	}

	abstract initMemory(): CreepMemory;
	run(creep: Creep): void
	{

	}
}