import {deepEquals, generateID} from "utils/misc";

export default abstract class JobBase
{
	id: Id<JobBase>;
	maxAssigned = 1;
	atom: any = null;
	assignedCreeps: Creep[] = [];
	constructor(public jobName: string,
		{
			maxAssigned = 1,
			atom = null,
		}:
		{
			maxAssigned?: number,
			atom?: any,
		})
	{
		this.id = generateID();
		this.maxAssigned = maxAssigned;
		this.atom = atom;
	}

	atomEquals(other: JobBase): boolean
	{
		return this.atom === other.atom || deepEquals(this.atom, other.atom);
	}

	assignJob(creep: Creep): void
	{
		creep.memory.assignedJob = this.id;
		this.assignedCreeps.push(creep);
		console.log(`ASSIGN ${this.jobName} TO ${creep.name}`);
	}

	unassignJob(creep: Creep): void
	{
		creep.memory.assignedJob = null;
		this.assignedCreeps = this.assignedCreeps.filter((remove: Creep) => remove.name !== creep.name);
		console.log(`UNASSIGN ${this.jobName} FROM ${creep.name}`);
	}

	unassignAll(): void
	{
		for(const creep of this.assignedCreeps)
		{
			this.unassignJob(creep);
		}
	}

	abstract run(): boolean;
}