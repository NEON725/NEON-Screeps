import {generateSpiral, log, LogLevel} from "utils/misc";
import {RoomAllocation} from "./MapIntel";

const MAX_PLACEMENT_ATTEMPTS = 2500;
const MAX_CONSTRUCTION_SITES = 1;

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
			const mapIntel = Memory.rooms[roomName];
			if(!mapIntel){continue;}
			const room = Game.rooms[roomName];
			switch(mapIntel.allocation)
			{
				case RoomAllocation.INDUSTRIAL:
					BuildingPlanner.planIndustrialDistrict(room);
					break;
				case RoomAllocation.NEUTRAL:
					BuildingPlanner.planEnergySourcePerimeter(room);
					break;
			}
		}
	}

	static planIndustrialDistrict(room: Room): void
	{
		const controller = room?.controller;
		if(!controller || !controller.my){return;}
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
		if(constructionSites.length >= MAX_CONSTRUCTION_SITES){return;}
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
		if(finishedConstructionSitePlacement || BuildingPlanner.planEnergySourcePerimeter(room)){return;}
		let attempts = 0;
		for(const location of BuildingPlanner.findConstructionLocation(room.name, BuildPlacementType.GRID_ROAD))
		{
			if(room.createConstructionSite(location, STRUCTURE_ROAD) === OK || ++attempts >= MAX_PLACEMENT_ATTEMPTS)
			{
				log(LogLevel.WALL, "CONSTRUCT", `Planned new road at ${location.x},${location.y}`);
				finishedConstructionSitePlacement = true;
				break;
			}
		}
	}

	static planEnergySourcePerimeter(room: Room): boolean
	{
		let finishedConstructionSitePlacement = false;
		const terrain = room.getTerrain();
		room.find(FIND_SOURCES).forEach((source: Source)=>
		{
			if(finishedConstructionSitePlacement){return;}
			for(const location of generateSpiral(source.pos, 9))
			{
				if((location.x === source.pos.x && location.y === source.pos.y) || terrain.get(location.x, location.y) !== TERRAIN_MASK_WALL){continue;}
				if(room.createConstructionSite(location, STRUCTURE_ROAD) === OK)
				{
					log(LogLevel.WALL, "CONSTRUCT", `Planned new road at ${location.x},${location.y}`);
					finishedConstructionSitePlacement = true;
				}
			}
		});
		return finishedConstructionSitePlacement;
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