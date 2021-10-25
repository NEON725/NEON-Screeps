import JobBase from "./JobBase";
import JobPriority from "./JobPriority";

export default class FillSpawnerJob extends JobBase
{
	spawnId: Id<StructureSpawn>;
	constructor(spawn: StructureSpawn)
	{
		super("FillSpawner",
			{
				maxAssigned: 8,
				atom: spawn.id,
				priority: JobPriority.DANGER,
			});
		this.spawnId = spawn.id;
	}

	run(): boolean
	{
		const spawn = Game.getObjectById(this.spawnId);
		return FillSpawnerJob.isJobNeeded(spawn);
	}

	static isJobNeeded(spawn: StructureSpawn | null): boolean
	{
		return spawn !== null && spawn.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
	}
}