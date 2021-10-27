import JobBase from "./JobBase";
import JobPriority from "./JobPriority";

export default class ChargeStructureJob extends JobBase
{
	structureId: Id<StructureWithStore>;
	constructor(structure: StructureWithStore)
	{
		super("ChargeStructure",
			{
				maxAssigned: 8,
				atom: structure.id,
				priority: JobPriority.DANGER,
			});
		this.structureId = structure.id;
	}

	run(): boolean
	{
		const structure = Game.getObjectById(this.structureId);
		return ChargeStructureJob.isJobNeeded(structure);
	}

	static isJobNeeded(structure: StructureWithStore | null): boolean
	{
		return structure !== null && structure.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
	}

	toString(): string
	{
		const structure = Game.getObjectById(this.structureId) as StructureWithStore
		return `${super.toString()}:${structure?.structureType || "???"}`;
	}
}