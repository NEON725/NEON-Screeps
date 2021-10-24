import JobBase from "jobs/JobBase";

export default class CreepMemoryBase implements CreepMemory
{
	role: string;
	assignedJob: Id<JobBase> | null = null;
	constructor(role: string)
	{
		this.role = role;
	}
}