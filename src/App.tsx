import React from "react"
import "./App.css"
import { observer } from "mobx-react-lite"
import { observable, action, autorun, computed, runInAction } from "mobx"

import "mobx-react-lite/batchingForReactDom"

type Vegetable = {
    id: string
    kind: "vegetable" | "fruit"
    wikidata_id: string
    available_months: number[]
}

const cucumber: Vegetable = {
    id: "cucumber",
    kind: "vegetable",
    wikidata_id: "Q2735883",
    available_months: [1, 2, 3, 4, 5, 6, 7],
}

const banana: Vegetable = {
    id: "banana",
    kind: "fruit",
    wikidata_id: "Q503",
    available_months: [1, 2, 3, 4, 5, 6, 7],
}

const getInitialEntries = () => [cucumber, banana]
class St {
    @observable pretty: boolean = false

    @action load = (rawJSON: string) => {
        this.entries = JSON.parse(rawJSON)
    }

    @observable entries: Vegetable[] = getInitialEntries()
    @action addVegetable = () => {
        const newVegetable: Vegetable = {
            available_months: [],
            id: "",
            kind: "fruit",
            wikidata_id: ""
        }
        this.entries.push(newVegetable)
    }
    @action reset = () => {
        this.entries = getInitialEntries()
    }
    @computed get json() {
        return {
            entries: this.entries,
            pretty: this.pretty,
        }
    }
    static STORAGE_KEY = "state"
    constructor() {
        try {
            const rawJSON = localStorage.getItem(St.STORAGE_KEY)
            if (rawJSON == null) throw new Error("no previous state")
            const json = JSON.parse(rawJSON)
            runInAction(() => {
                this.entries = json.entries
                this.pretty = json.pretty
            })
        } catch (error) {
            console.log("impossible to load previous save")
            console.log(error)
        }

        // autosave
        autorun(() => {
            localStorage.setItem(St.STORAGE_KEY, JSON.stringify(this.json))
        })
    }
}
const emoji = (emoji: string) => (
    <span role="img" aria-label="emoji">
        {emoji}
    </span>
)

const st = new St()
const App = observer(() => {
    return (
        <div className="App">
            <div className="row">
                <div className="pane-editor  grow basis1 noshrink">
                    <h1>Editor</h1>
                    <button onClick={() => st.addVegetable()}>ADD</button>
                    <button onClick={() => st.reset()}>RESET</button>
                    <div className="row">
                        <div className="hidden">{emoji("➖")}</div>
                        <div className="hidden">{emoji("🍆")}</div>
                        <div className="pad"></div>
                        {allMonths.map((m) => (
                            <div key={m} className="month-label">
                                {m}
                            </div>
                        ))}
                    </div>

                    {st.entries.map((entry, ix) => (
                        <EntryUI entry={entry} ix={ix} key={ix} />
                    ))}
                </div>
                <PreviewUI />
            </div>
        </div>
    )
})
const EntryUI = observer(function EntryUI(props: {
    entry: Vegetable
    ix: number
}) {
    const { entry, ix } = props
    return (
        <div className="vegetable row">
            {/* DELETE BTN */}
            <div className="clickable" onClick={() => st.entries.splice(ix, 1)}>
                {emoji("➖")}
            </div>
            <div
                className="clickable"
                onClick={() => {
                    entry.kind = entry.kind === "fruit" ? "vegetable" : "fruit"
                }}
            >
                {entry.kind === "fruit" ? emoji("🍑") : emoji("🍆")}
            </div>
            {inputText(entry, "id")}
            {inputText(entry, "wikidata_id")}
            {inputMonths(entry)}
        </div>
    )
})
const PreviewUI = observer(function PreviewUI() {
    return (
        <div className="pane-json  grow basis1 noshrink col">
            <h1>JSON</h1>
            {inputCheckbox(st, "pretty")}
            <textarea
                className="grow"
                cols={30}
                rows={10}
                onChange={(ev) => st.load(ev.target.value)}
                value={
                    st.pretty
                        ? JSON.stringify(st.entries, null, 4)
                        : JSON.stringify(st.entries)
                }
            ></textarea>
        </div>
    )
})
export default App

const inputText = (owner: any, key: string) => (
    <label className="row line">
        <input
            //
            value={owner[key]}
            type="text"
            onChange={(ev) => (owner[key] = ev.target.value)}
        />
    </label>
)

const inputCheckbox = (owner: any, key: string) => (
    <label className="row line">
        <div className="clickable" onClick={(ev) => (owner[key] = !owner[key])}>
            {owner[key] ? "✅" : "❌"}
        </div>
    </label>
)

const inputMonths = (vegetable: Vegetable) => (
    <label className="row line">
        {/* <div className="label">availability</div> */}
        {allMonths.map((m, ix) => {
            const months = vegetable.available_months
            const index = ix + 1
            const available = months.indexOf(index) >= 0
            return (
                <div
                    key={ix}
                    className="month-availability clickable"
                    onClick={(ev) => {
                        // if already available
                        if (available) {
                            vegetable.available_months = months.filter(
                                (i) => i !== index
                            )
                            return
                        }
                        // if already present, return
                        if (months.includes(index)) return
                        // othwerwise, add it
                        months.push(index)
                        // sort it
                        vegetable.available_months = months
                            .slice()
                            .sort((x, y) => x - y)
                        return
                    }}
                >
                    {available ? emoji("✅") : emoji("❌")}
                </div>
            )
        })}
    </label>
)

// prettier-ignore
const allMonths = [ "janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre", ]
