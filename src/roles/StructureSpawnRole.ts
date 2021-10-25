import JobBase from "jobs/JobBase";
import SpawnCreepJob from "jobs/SpawnCreepJob";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "types/CreepRole";

export default class StructureSpawnRole extends CreepRole
{
	constructor()
	{
		super("StructureSpawn");
	}

	initMemory(): CreepMemory
	{
		return new CreepMemoryBase(this.roleName);
	}

	canAcceptJob(creep: JobAssignable, job: JobBase): boolean
	{
		const spawn = creep as unknown as StructureSpawn;
		const spawnJob = job as SpawnCreepJob;
		return spawn.spawnCreep(spawnJob.body, spawnJob.name, {dryRun: true}) === OK;
	}

	run(creep?: Creep, structure?: Structure): void
	{
		const spawn = structure as StructureSpawn;
		const spawnJob = global.jobQueue.getJobById(spawn.memory.assignedJob) as SpawnCreepJob;
		if(spawnJob !== null && !spawn.spawning)
		{
			const result = spawn.spawnCreep(spawnJob.body, spawnJob.name, {memory: spawnJob.initialMemory});
			if(result === OK){spawnJob.reportCompletedScreep();}
			else{console.error(`Failed to spawn: ${spawnJob.toString()}`);}
			spawnJob.unassignJob(spawn);
		}
	}
}