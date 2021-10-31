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
	return (Math.floor(Math.random() * 8) + 1) as DirectionConstant;
}

export function generateID<T>(): Id<T>
{
	return ("xxxx-xxxx-xxx-xxxx".replace(/[x]/g, function(c)
	{
		/* eslint-disable no-bitwise */
		const r = Math.random() * 16 | 0; const v = c === "x" ? r : (r & 0x3 | 0x8);
		return v.toString(16);
		/* eslint-enable no-bitwise */
	})) as Id<T>;
}

export function generateRandomName(): string
{
	while(true)
	{
		const i = Math.floor(Math.random() * names.length);
		const retval = names[i];
		if(!Game.creeps[retval]){return retval;}
	}
}

export function isJobAssignable(ent: RoomObject)
{
	const a = ent as any;
	return ("name" in a) && ("memory" in a);
}

export function moveTo(
	self: Creep,
	target: RoomPosition | _HasRoomPosition,
	extraOpts?: any
): CreepMoveReturnCode | -2 | -5 | -7
{
	if(self.fatigue > 0){return OK;}
	let pos = ("pos" in target) ? target.pos : target;
	const opts: any = {reusePath: 20, noPathFinding: true, ...(extraOpts || {visualizePathStyle: {}})};
	let retVal = self.moveTo(pos, opts);
	if(retVal === ERR_INVALID_TARGET)
	{
		pos = new RoomPosition(pos.x, pos.y, pos.roomName);
		retVal = self.moveTo(pos, opts);
	}
	if(retVal === ERR_NOT_FOUND || retVal === ERR_NO_PATH)
	{
		opts.noPathFinding = false;
		retVal = self.moveTo(pos, opts);
	}
	return retVal;
}

export function padString(base: string, length: number, pad?: string, left?: boolean)
{
	const _pad = pad || " ";
	const padLength = length - base.length;
	const repetitions = Math.ceil(padLength / _pad.length);
	let padding = "";
	for(let i = 0; i < repetitions; i++){padding += _pad;}
	padding = padding.substr(0, padLength);
	return left ? padding + base : base + padding;
}

export enum LogLevel
{ /* eslint-disable-line @typescript-eslint/indent */
	WALL,
	INFO,
	EVENT,
	DANGER,
}

let logLevel: LogLevel = LogLevel.INFO;
export function setLogLevel(level: LogLevel){logLevel = level;}

const PREFIX_LENGTH = 12;
const NAME_LENGTH = 12;
const ROLE_LENGTH = 8;
const NAME_COLOR = "#ccffcc";
const ROLE_COLOR = "#99ff99";
const DEFAULT_COLOR = "#ffffff";
const DULL_COLOR = "#999999";
const LEVEL_COLORS: string[] = [];
LEVEL_COLORS[LogLevel.WALL] = DULL_COLOR;
LEVEL_COLORS[LogLevel.EVENT] = "#aaaaff";
LEVEL_COLORS[LogLevel.DANGER] = "#ff4444";

export function log(level: LogLevel, prefix: string, message: string, creep?: JobAssignable)
{
	if(level >= logLevel)
	{
		const matchCreep = level <= LogLevel.WALL || level >= LogLevel.EVENT;
		const prefixColorCode = `${LEVEL_COLORS[level] || DEFAULT_COLOR}-fg`;
		const prefixPad = padString(prefix, PREFIX_LENGTH);
		let nameLogged; let roleLogged;
		const nameColor = matchCreep ? LEVEL_COLORS[level] : NAME_COLOR;
		const roleColor = matchCreep ? LEVEL_COLORS[level] : ROLE_COLOR;
		if(creep)
		{
			nameLogged = `{${nameColor}-fg}${padString(creep.name, NAME_LENGTH)}{/${nameColor}-fg}`;
			const memory = creep.memory;
			const roleName = memory?.role;
			if(roleName){roleLogged = `{${roleColor}-fg}${padString(roleName, ROLE_LENGTH)}{/${roleColor}-fg}`;}
		}
		if(!nameLogged){nameLogged = `{${DULL_COLOR}-fg}${padString("", NAME_LENGTH, "_")}{/${DULL_COLOR}-fg}`;}
		if(!roleLogged){roleLogged = `{${DULL_COLOR}-fg}${padString("", ROLE_LENGTH, "_")}{/${DULL_COLOR}-fg}`;}
		console.log(`{${prefixColorCode}}${prefixPad}{/${prefixColorCode}}|${nameLogged}|${roleLogged}| {${prefixColorCode}}${message}{/${prefixColorCode}}`);
	}
}

export function tempDebug(msg: string, creep?: JobAssignable): void
{
	setLogLevel(LogLevel.WALL);
	log(LogLevel.WALL, "DEBUG", msg, creep);
}

export function isExit(pos: RoomPosition): boolean
{
	return pos.x === 0 || pos.x === 49 || pos.y === 0 || pos.y === 49;
}