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
		return true;
	}

	getJobById(id: Id<JobBase> | null): JobBase | null
	{
		if(id === null){return null;}
		return this.jobs.reduce((prev, next) => next.id === id ? next : prev, null as JobBase | null);
	}

	getNextFillableJob(): JobBase | null
	{
		if(this.jobs.length === 0){return null;}
		for(let attempts = 0;attempts < this.jobs.length;attempts++)
		{
			this.nextJobIndex++;
			if(this.nextJobIndex >= this.jobs.length){this.nextJobIndex = 0;}
			const job = this.jobs[this.nextJobIndex];
			if(job.assignedCreeps.length < job.maxAssigned)
			{
				this.nextJobIndex = 0;
				return job;
			}
		}
		return null;
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