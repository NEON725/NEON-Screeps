import {log, LogLevel} from "utils/misc";
import JobBase from "./JobBase"
import JobPriority, {getJobPrioritiesSorted} from "./JobPriority";

export default class JobQueue
{
	nextJobIndex = 0;
	jobs: JobBase[] = [];
	fillableJobs: JobBase[] = [];

	addJob(job: JobBase): boolean
	{
		const previousExists = this.jobs.reduce((prev, next) => job.atomEquals(next) ? next : prev, null as JobBase | null);
		if(previousExists){return false;}
		this.jobs.push(job);
		log(LogLevel.INFO, "NEW JOB", job.toString());
		return true;
	}

	getJobById(id: Id<JobBase> | null | undefined): JobBase | null
	{
		if(id === null || id === undefined){return null;}
		return this.jobs.reduce((prev, next) => next.id === id ? next : prev, null as JobBase | null);
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
		const prioritiesInOrder = getJobPrioritiesSorted();
		const fillableJobsByPriority: JobBase[][] = [];
		for(const prio of prioritiesInOrder){fillableJobsByPriority[prio] = [];}
		this.jobs = this.jobs.filter(job =>
		{
			const keep = job.run();
			if(!keep)
			{
				job.unassignAll();
				log(LogLevel.INFO, "DROP JOB", job.toString());
			}
			else if(job.assigned.length < job.maxAssigned)
			{
				fillableJobsByPriority[job.priority].push(job);
			}
			return keep;
		});
		this.fillableJobs = [];
		for(const prio of prioritiesInOrder)
		{
			this.fillableJobs.push(...fillableJobsByPriority[prio]);
		}
	}

	attemptFillJob(ent: JobAssignable, job: JobBase | null): boolean
	{
		const memory = ent.memory;
		const role = global.roleIndex.getRole(ent);
		if(job != null && !memory.assignedJob && role.canAcceptJob(ent, job))
		{
			job.assignJob(ent);
			return true;
		}
		return false;
	}
}