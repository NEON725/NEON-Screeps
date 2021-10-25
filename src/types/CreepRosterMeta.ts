import JobBase from "jobs/JobBase";
import SpawnCreepJob from "jobs/SpawnCreepJob";

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
}