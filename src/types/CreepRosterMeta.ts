import JobBase from "jobs/JobBase";
import JobPriority from "jobs/JobPriority";
import SpawnCreepJob from "jobs/SpawnCreepJob";

const WORKER_PERCENTAGE = 0.4;
const SCOUT_PERCENTAGE = 0.1;
const MULE_PERCENTAGE = 0.2;
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

	generateSpawnJob(budget: number, spawners: number): JobBase | null
	{
		if(this.total >= POPULATION_MAX){return null;}
		if(this.getTotal("Worker") < 1)
		{
			return new SpawnCreepJob("Worker", "minimum-worker-amount", JobPriority.DANGER, budget);
		}
		if(this.getTotal("Worker") < Math.ceil(this.total * WORKER_PERCENTAGE))
		{
			return new SpawnCreepJob("Worker", "minimum-worker-percent", JobPriority.EXPAND, budget);
		}
		if(this.getTotal("Mule") < Math.floor(this.total * MULE_PERCENTAGE))
		{
			return new SpawnCreepJob("Mule", "minimum-mule-percent", JobPriority.EXPAND, budget);
		}
		if(this.getTotal("Scout") < Math.floor(this.total * SCOUT_PERCENTAGE))
		{
			return new SpawnCreepJob("Scout", "minimum-scout-percent", JobPriority.EXPAND, budget);
		}
		return new SpawnCreepJob("Worker", "idle-spawn", JobPriority.TIMESINK, budget);
	}
}