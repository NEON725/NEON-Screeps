import JobBase from "./JobBase"

export default class JobQueue
{
	jobs: JobBase[] = [];

	addJob(job: JobBase): boolean
	{
		const previousExists = this.jobs.reduce((prev, next) => job.atomEquals(next) ? next : prev, null as JobBase | null);
		if(previousExists){return false;}
		this.jobs.push(job);
		return true;
	}

	getJobById(id: Id<JobBase> | null): JobBase | null
	{
		if(id === null){return null;}
		return this.jobs.reduce((prev, next) => next.id === id ? next : prev, null as JobBase | null);
	}

	getNextFillableJob(): JobBase | null
	{
		return this.jobs.reduce((prev, next) => (!prev && next.assignedCreeps.length < next.maxAssigned) ? next : prev, null as JobBase | null);
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
			if(!keep){job.unassignAll();}
			return keep;
		});
	}
}