import {reduce} from "lodash";
import {log, LogLevel} from "utils/misc";

export const BUILD_TARGETS: BuildableStructureConstant[][] =
[
	[STRUCTURE_SPAWN],
	[
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
	],
	[
		STRUCTURE_TOWER,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
	],
	[
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_EXTENSION,
		STRUCTURE_STORAGE,
	],
];

export default class BuildingPlanner
{
	static run(): void
	{
		for(const roomName in Game.rooms)
		{
			const room = Game.rooms[roomName];
			const controller = room?.controller;
			if(!controller || !controller.my){continue;}
			const rcl = controller.level;
			const currentBuildTargets = BUILD_TARGETS
				.slice(0, rcl)
				.reduce(
					(prev: BuildableStructureConstant[], next: BuildableStructureConstant[])=>
						prev.concat(next),
					[] as BuildableStructureConstant[]
				);
			const constructionSites = room.find(
				FIND_CONSTRUCTION_SITES,
				{filter: (site: ConstructionSite)=>site.my}
			);
			if(constructionSites.length > 0){continue;}
			const myBuiltStructureTallies: {[key: string]: number} = {};
			room.find(FIND_MY_STRUCTURES).forEach((structure: AnyOwnedStructure)=>
			{
				myBuiltStructureTallies[structure.structureType]
					= (myBuiltStructureTallies[structure.structureType] || 0) + 1;
			});
			let abortConstructionSitePlacement = false;
			const buildTargetTalliesCumulative: {[key: string]: number} = {};
			currentBuildTargets.forEach((structureType: BuildableStructureConstant)=>
			{
				if(abortConstructionSitePlacement){return;}
				const buildCountTarget = (buildTargetTalliesCumulative[structureType] || 0) + 1;
				buildTargetTalliesCumulative[structureType] = buildCountTarget;
				if(myBuiltStructureTallies[structureType] < buildCountTarget)
				{
					for(let i = 0; i < 10 && !abortConstructionSitePlacement; i++)
					{
						const result: ScreepsReturnCode = room.createConstructionSite(_.random(6) + 22, _.random(6) + 22, structureType);
						if(result === OK){abortConstructionSitePlacement = true;}
					}
					if(abortConstructionSitePlacement){log(LogLevel.INFO, "CONSTRUCT", `Planned new ${structureType}.`);}
					else{abortConstructionSitePlacement = true;}
				}
			});
		}
	}
}