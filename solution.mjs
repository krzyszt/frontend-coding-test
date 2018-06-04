
function add(...args) {
    let result = 0;
    args.forEach(n => result+=n);
    return result;
}

function listToObject(list) {
    return list.reduce((acc, n) => {
        acc[n.name] = JSON.parse(JSON.stringify(n.value));
        return acc
    }, {});
}

function objectToList(obj) {
    return Object
                .keys(obj)
                .map(key => ({ 
                    name: key, 
                    value: JSON.parse(JSON.stringify(obj[key])) 
                }));
}

function convertArray(obj) {
    return key => {
        Array.isArray(obj[key]) ? [] : obj[key];
    }
}

function serialize(obj) {
    return Object.keys(obj).reduce((acc, n) => {
        if (!Array.isArray(obj[n])) {
            acc[n] = obj[n];
        } else {
            obj[n]
                .forEach((i,index) => {
                    Object
                        .keys(i)
                        .forEach((a) => {
                            (typeof(i[a]) !== 'object') ? 
                                acc[`${n}${index}_${a}`] = i[a] : 
                                acc[`${n}${index}_${a}`] = serialize(i[a]);
                        });
                });
        }
        return acc;
    }, {});
}

function sharedStart(array){
    const A = array.concat().sort();
    const a1 = A[0];
    const a2 = A[A.length-1];
    const L = a1.length;
    let i = 0;

    while(i < L && a1.charAt(i) === a2.charAt(i)) i++;

    return a1.substring(0, i);
}

function formatValue(val) {
    let formatted = val;
    if ( typeof val === 'string' && val.search(':') > -1) {
        const timeIndex = val.search(':');
        const time = val.slice(timeIndex + 1); 
        const dt = new Date(parseInt(time));
        const dd = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate();
        const mm = (dt.getMonth() + 1) ? `0${dt.getMonth() + 1}` : dt.getMonth() + 1;
        const yyyy = dt.getFullYear();
        formatted = `${dd}/${mm}/${yyyy}`;
    }
    return formatted;
}

function deserialize(obj) {
    let keys = Object.keys(obj);
    let notRowPropName = '';
    if (sharedStart(keys) === '') {
        notRowPropName = keys.pop();
    }
    const rowName = sharedStart(keys);
    const rowNameLength = rowName.length;

    const arr = keys.reduce((acc, current) => {
        const propName = current.slice(current.search('_') + 1);
        const prefix = current.slice(0, current.search('_'));
        const no = prefix.slice(rowNameLength);
        const val = (typeof obj[current] !== 'object' ) ? formatValue(obj[current]) : deserialize(obj[current])
        
        if (!acc[no]) {    
            acc[no] = { [propName]: val };
        } else {
            acc[no][propName] = (typeof obj[current] !== 'object' ) ? formatValue(obj[current]) : deserialize(obj[current]);
        }
        return acc;
    }, []);

    const deserialized = { 
        [rowName] : arr 
    };

    if (notRowPropName !== '') {
        deserialized[notRowPropName] = obj[notRowPropName];
    }

    return deserialized;
}

export { add, listToObject, objectToList, serialize, deserialize };