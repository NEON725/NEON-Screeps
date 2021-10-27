import JobBase from "jobs/JobBase";
import SpawnCreepJob from "jobs/SpawnCreepJob";
import CreepMemoryBase from "types/CreepMemoryBase";
import CreepRole from "roles/CreepRole";
import {generateRandomName, log, LogLevel} from "utils/misc";

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
		if(job.jobName !== "SpawnCreep"){return false;}
		const spawn = creep as unknown as StructureSpawn;
		const spawnJob = job as SpawnCreepJob;
		return spawn.spawnCreep(spawnJob.body, "dryrun", {dryRun: true}) === OK;
	}

	run(creep?: Creep, structure?: Structure): void
	{
		const spawn = structure as StructureSpawn;
		const spawnJob = global.jobQueue.getJobById(spawn.memory.assignedJob) as SpawnCreepJob;
		if(spawnJob !== null && !spawn.spawning)
		{
			const result = spawn.spawnCreep(spawnJob.body, generateRandomName(), {memory: spawnJob.initialMemory});
			if(result === OK){spawnJob.reportCompletedScreep();}
			else{log(LogLevel.DANGER, "SPAWN", `Failed to spawn: ${spawnJob.toString()}`);}
			spawnJob.unassignJob(spawn);
		}
	}

	generateBody(unused: number): BodyPartConstant[]
	{
		throw new Error("Cannot generate body specifications for structure.");
	}
}