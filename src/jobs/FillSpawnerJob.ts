import JobBase from "./JobBase";

export default class FillSpawnerJob extends JobBase
{
	spawnId: Id<StructureSpawn>;
	constructor(spawn: StructureSpawn)
	{
		super("FillSpawner", {maxAssigned: 3, atom: spawn.id});
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