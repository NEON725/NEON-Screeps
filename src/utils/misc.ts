import CreepRole from "types/CreepRole";
import names from "utils/names.json";

export function deepEquals(a: any, b: any)
{
	if(Object.keys(a).length !== Object.keys(b).length)
	{
		return false
	}

	for(const key in a)
	{
		const aValue = a[key]
		const bValue = b[key]
		if((aValue instanceof Object && !deepEquals(aValue, bValue)) || (!(aValue instanceof Object) && aValue !== bValue))
		{
			return false
		}
	}
	return true
}

export function randomDirection(): DirectionConstant
{
	return(Math.floor(Math.random() * 8) + 1) as DirectionConstant;
}

export function generateID<T>(): Id<T>
{
	return("xxxx-xxxx-xxx-xxxx".replace(/[x]/g, function(c)
	{
		/* eslint-disable no-bitwise */
		const r = Math.random() * 16 | 0; const v = c === "x" ? r : (r & 0x3 | 0x8);
		return v.toString(16);
		/* eslint-enable no-bitwise */
	})) as Id<T>;
}

export function generateRandomName(): string
{
	const i = Math.floor(Math.random() * names.length);
	const retval = names[i];
	return retval;
}

export function spawnCreep(spawn: StructureSpawn, role: CreepRole)
{
	spawn.spawnCreep([WORK, CARRY, MOVE], generateRandomName(), {memory: role.initMemory()})
}