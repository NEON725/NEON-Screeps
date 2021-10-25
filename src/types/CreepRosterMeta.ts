import JobBase from "jobs/JobBase";
import SpawnCreepJob from "jobs/SpawnCreepJob";

const WORKER_PERCENTAGE = 0.4;
const POPULATION_MAX = 50;

export default class CreepRosterMeta
{
	total = 0;
	totalsByName = new Map<string, number>();

	tallyCreep(creep: Creep): void
	{
		this.total++;
		this.totalsByName.set(creep.memory.role, (this.totalsByName.get(creep.memory.role) || 0) + 1);
	}

	getTotal(role: string): number
	{
		return this.totalsByName.get(role) || 0;
	}

	generateSpawnJob(spawners: number): JobBase | null
	{
		if(this.getTotal("Worker") < Math.ceil(this.total * WORKER_PERCENTAGE))
		{
			return new SpawnCreepJob("Worker", "minimum-worker-percent");
		}
		if(this.total < POPULATION_MAX)
		{
			return new SpawnCreepJob("Worker", "idle-spawn");
		}
		return null;
	}
}