
type YAPIData = IntegerProperty | NumberProperty |
    BooleanProperty | ArrayProperty | ObjectProperty | StringProperty


interface BasePropertyItem {
    format?: string
    description?: string
    refType?: any
}

interface IntegerProperty extends BasePropertyItem {
    type: "integer"
}
interface NumberProperty extends BasePropertyItem {
    type: "number"
}

interface BooleanProperty extends BasePropertyItem {
    type: "boolean"
}
interface StringProperty extends BasePropertyItem {
    type: "string"
}
interface ArrayProperty extends BasePropertyItem {
    type: "array"
    items: YAPIData
}

interface ObjectProperty extends BasePropertyItem {
    type: "object"
    required?: string[]
    properties: {
        [k: string]: YAPIData
    }
    $$ref?: any
    $$schema?: any
}


