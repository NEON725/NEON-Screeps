import {deepEquals, generateID} from "utils/misc";
import JobPriority from "./JobPriority";

export default abstract class JobBase
{
	id: Id<JobBase>;
	maxAssigned;
	atom: any;
	priority: JobPriority;
	assigned: JobAssignable[] = [];
	constructor(public jobName: string,
		{
			maxAssigned = 1,
			atom = null,
			priority = JobPriority.TIMESINK,
		}:
		{
			maxAssigned?: number,
			atom?: any,
			priority?: JobPriority
		})
	{
		this.id = generateID();
		this.maxAssigned = maxAssigned;
		this.atom = atom;
		this.priority = priority;
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