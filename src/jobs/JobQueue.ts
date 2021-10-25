import RoleIndex from "roles/RoleIndex";
import JobBase from "./JobBase"

export default class JobQueue
{
	nextJobIndex = 0;
	jobs: JobBase[] = [];

	addJob(job: JobBase): boolean
	{
		const previousExists = this.jobs.reduce((prev, next) => job.atomEquals(next) ? next : prev, null as JobBase | null);
		if(previousExists){return false;}
		this.jobs.push(job);
		console.log(`NEW JOB: ${job.toString()}`);
		return true;
	}

	getJobById(id: Id<JobBase> | null | undefined): JobBase | null
	{
		if(id === null || id === undefined){return null;}
		return this.jobs.reduce((prev, next) => next.id === id ? next : prev, null as JobBase | null);
	}

	getNextFillableJob(): JobBase | null
	{
		if(this.jobs.length === 0){return null;}
		let retVal: JobBase | null = null;
		this.nextJobIndex++;
		if(this.nextJobIndex >= this.jobs.length){this.nextJobIndex = 0;}
		for(let i = 0; i < this.jobs.length; i++)
		{
			const index = (this.nextJobIndex + i) % this.jobs.length;
			const job = this.jobs[index];
			if
			(
				job.assigned.length < job.maxAssigned
				&& (retVal === null || retVal.priority < job.priority)
			)
			{
				retVal = job;
			}
		}
		return retVal;
	}

	flushJobs(): void
	{
		/* eslint-disable-next-line @typescript-eslint/no-for-in-array */
		for(const index in this.jobs)
		{
			delete this.jobs[index];
		}
		this.jobs = [];
	}

	run(): void
	{
		this.jobs = this.jobs.filter(job =>
		{
			const keep = job.run();
			if(!keep)
			{
				job.unassignAll();
				console.log(`DROP JOB: ${job.toString()}`);
			}
			return keep;
		});
	}

	attemptFillJob(ent: JobAssignable, job: JobBase | null): boolean
	{
		const memory = ent.memory;
		if(memory === undefined)
		{
			console.log(ent);
			console.log(ent.name);
		}
		const role = global.roleIndex.getRole(ent);
		if(job != null && !memory.assignedJob && role.canAcceptJob(ent, job))
		{
			job.assignJob(ent);
			return true;
		}
		return false;
	}
}