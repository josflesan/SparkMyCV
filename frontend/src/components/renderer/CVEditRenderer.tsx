import { View } from "@react-pdf/renderer";
import { RawCVComponentChildren, RawCVComponentObject, WithType, RawCVObject } from "./CVRenderer";
import { SetStateAction } from "react";

function renderChildren(children: RawCVComponentChildren, parentType: RawCVComponentObject["type"]) {
    if (typeof children === "string") {
        return children;
    } else {
        return children.map((child, index) => {
            if (typeof child === "string") {
                return <CVEditRendererAssigner key={index} cv={{
                    type: parentType,
                    content: child
                }} />
            } else {
                return <CVEditRendererAssigner key={index} cv={child} />
            }
        })
    }
}

function BulletRenderer({ content }: WithType<RawCVComponentObject, "bullet">) {
    const children = renderChildren(content, "bullet")
    return (
        <ul>
            {renderChildren(content, "bullet")}
        </ul>
    )
}

function PRenderer({ content }: WithType<RawCVComponentObject, "p">) {
    const children = renderChildren(content, "p")
    return (
        <p>
            {renderChildren(content, "p")}
        </p>
    )
}

function H1Renderer({ content }: WithType<RawCVComponentObject, "h1">) {
    return (
        <h1>
            {renderChildren(content, "h1")}
        </h1>
    )
}

function H2Renderer({ content }: WithType<RawCVComponentObject, "h2">) {
    return (
        <h2>
            {renderChildren(content, "h2")}
        </h2>
    )
}

function H3Renderer({ content }: WithType<RawCVComponentObject, "h3">) {
    return (
        <h3>
            {renderChildren(content, "h3")}
        </h3>
    )
}

function CVEditRendererAssigner({ cv }: { cv: RawCVComponentObject }): JSX.Element {
    switch (cv.type) {
        case "bullet":
            return <BulletRenderer {...cv as WithType<RawCVComponentObject, "bullet">} />
        case "p":
            return <PRenderer {...cv as WithType<RawCVComponentObject, "p">} />
        case "h1":
            return <H1Renderer {...cv as WithType<RawCVComponentObject, "h1">} />
        case "h2":
            return <H2Renderer {...cv as WithType<RawCVComponentObject, "h2">} />
        case "h3":
            return <H3Renderer {...cv as WithType<RawCVComponentObject, "h3">} />
        case "div":
            return <PRenderer {...cv as WithType<RawCVComponentObject, "p">} /> // Hack!
    }
}

// function getChildContentSetter(content, contentSetter, childIndex) {
//     if (!Array.isArray(content)) {
//         return ()=>{}
//     } else {
//         return contentSetter((old) => {

//         })
//     }
// }

export function CVEditorDocument({ content, contentSetter }: { content: RawCVObject, contentSetter: SetStateAction<RawCVObject>}) {
    return (
        <div>
            {content.map((cv, index) => <CVEditRendererAssigner key={index} cv={cv} />)}
        </div>
    )
}