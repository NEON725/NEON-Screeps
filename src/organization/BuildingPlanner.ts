import {generateSpiral, log, LogLevel} from "utils/misc";

const MAX_PLACEMENT_ATTEMPTS = 2500;

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

enum BuildPlacementType
{ /* eslint-disable-line */
	RANDOM,
	GRID,
	GRID_ROAD,
	POPULATION_AVERAGE,
}

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
			let finishedConstructionSitePlacement = false;
			const buildTargetTalliesCumulative: {[key: string]: number} = {};
			currentBuildTargets.forEach((structureType: BuildableStructureConstant)=>
			{
				if(finishedConstructionSitePlacement){return;}
				const buildCountTarget = (buildTargetTalliesCumulative[structureType] || 0) + 1;
				buildTargetTalliesCumulative[structureType] = buildCountTarget;
				if((myBuiltStructureTallies[structureType] || 0) < buildCountTarget)
				{
					let attempts = 0;
					for(const location of BuildingPlanner.findConstructionLocation(room.name, BuildingPlanner.getPlacementTypeByStructure(structureType)))
					{
						if(room.createConstructionSite(location, structureType) === OK)
						{
							finishedConstructionSitePlacement = true;
							log(LogLevel.INFO, "CONSTRUCT", `Planned new ${structureType} at ${location.x},${location.y}.`);
							break;
						}
						else if(++attempts >= MAX_PLACEMENT_ATTEMPTS){break;}
					}
				}
			});
			if(finishedConstructionSitePlacement){continue;}
			room.find(FIND_SOURCES).forEach((source: Source)=>
			{
				if(finishedConstructionSitePlacement){return;}
				for(const location of generateSpiral(source.pos,9))
				{
					if(location.x===source.pos.x&&location.y===source.pos.y){continue;}
					if(room.createConstructionSite(location, STRUCTURE_ROAD) === OK)
					{
						log(LogLevel.WALL, "CONSTRUCT", `Planned new road at ${location.x},${location.y}`);
						finishedConstructionSitePlacement = true;
					}
				}
			});
			if(finishedConstructionSitePlacement){continue;}
			let attempts = 0;
			for(const location of BuildingPlanner.findConstructionLocation(room.name, BuildPlacementType.GRID_ROAD))
			{
				if(room.createConstructionSite(location, STRUCTURE_ROAD)===OK || ++attempts >= MAX_PLACEMENT_ATTEMPTS)
				{
					log(LogLevel.WALL, "CONSTRUCT", `Planned new road at ${location.x},${location.y}`);
					finishedConstructionSitePlacement = true;
					break;
				}
			}
		}
	}

	static findConstructionLocation = function*(roomName: string, type: BuildPlacementType): Generator<RoomPosition>
	{
		let isRoad = false;
		switch(type)
		{
			case BuildPlacementType.RANDOM:
				while(true){yield new RoomPosition(_.random(49), _.random(49), roomName);}
			case BuildPlacementType.POPULATION_AVERAGE:
				while(true){yield global.creepRosterMeta.getPositionAverage(roomName);}
			case BuildPlacementType.GRID_ROAD:
				isRoad = true;
				/* eslint-disable-next-line no-fallthrough */
			case BuildPlacementType.GRID:
				for(const pos of generateSpiral(roomName))
				{
					const diagonal = (pos.y + pos.x) % 2 === 0
					if(diagonal === isRoad){yield pos;}
				}
		}
	}

	static getPlacementTypeByStructure(type: BuildableStructureConstant): BuildPlacementType
	{
		switch(type)
		{
			default:
				return BuildPlacementType.RANDOM;
			case STRUCTURE_EXTENSION:
				return BuildPlacementType.GRID;
			case STRUCTURE_ROAD:
				return BuildPlacementType.GRID_ROAD;
			case STRUCTURE_TOWER:
				return BuildPlacementType.POPULATION_AVERAGE;
		}
	}
}