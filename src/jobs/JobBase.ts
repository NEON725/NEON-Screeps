import {deepEquals, generateID} from "utils/misc";

export default abstract class JobBase
{
	id: Id<JobBase>;
	maxAssigned = 1;
	atom: any = null;
	assigned: JobAssignable[] = [];
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
		return !!(this.atom && other.atom && (this.atom === other.atom || deepEquals(this.atom, other.atom)));
	}

	assignJob(creep: JobAssignable): void
	{
		creep.memory.assignedJob = this.id;
		this.assigned.push(creep);
		console.log(`ASSIGN ${this.toString()} TO ${creep.name}`);
	}

	unassignJob(creep: JobAssignable): void
	{
		creep.memory.assignedJob = null;
		this.assigned = this.assigned.filter((remove: JobAssignable) => remove.name !== creep.name);
		console.log(`UNASSIGN ${this.toString()} FROM ${creep.name}`);
	}

	unassignAll(): void
	{
		for(const creep of this.assigned)
		{
			this.unassignJob(creep);
		}
	}

	abstract run(): boolean;

	toString(): string
	{
		/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */
		return `${this.jobName}:${this.atom}`;
	}
}