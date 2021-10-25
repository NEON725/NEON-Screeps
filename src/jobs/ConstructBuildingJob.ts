import JobBase from "./JobBase";
import JobPriority from "./JobPriority";

export default class ConstructBuildingJob extends JobBase
{
	constructionSiteId: Id<ConstructionSite>;
	constructor(site: ConstructionSite)
	{
		super(
			"ConstructBuilding",
			{
				maxAssigned: 8,
				atom: site.id,
				priority: ConstructBuildingJob.getPriorityFromBuildingType(site.structureType),
			}
		);
		this.constructionSiteId = site.id;
	}

	static getPriorityFromBuildingType(type: StructureConstant): JobPriority
	{
		switch(type)
		{
			case STRUCTURE_TOWER:
				return JobPriority.DANGER;
			default:
				return JobPriority.EXPAND;
		}
	}

	run(): boolean
	{
		const site = Game.getObjectById(this.constructionSiteId);
		return site !== null;
	}
}