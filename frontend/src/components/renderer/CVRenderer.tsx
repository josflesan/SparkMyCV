import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { render } from 'react-dom';

export type RawCVComponentObject = {
    type: "bullet" | "p" | "h1" | "h2" | "h3" | "div"
    content: RawCVComponentChildren
}

export type RawCVComponentChildren = string | ((RawCVComponentObject|string)[])

export type WithType<T, U> = T & { type: U }

export type RawCVObject = RawCVComponentObject[]

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subheader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subsubheader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 12,
        marginBottom: 10,
    },
});

function renderChildren(children: RawCVComponentChildren, parentType: RawCVComponentObject["type"]) {
    if (typeof children === "string") {
        return children;
    } else {
        return children.map((child, index) => {
            if (typeof child === "string") {
                return <CVRendererAssigner key={index} cv={{
                    type: parentType,
                    content: child
                }}/>
            } else {
                return <CVRendererAssigner key={index} cv={child}/>
            }
        })
}}

export function BulletRenderer({ content }: WithType<RawCVComponentObject, "bullet">) {
    const children = renderChildren(content, "bullet")
    return (
        <Text style={styles.paragraph}>
            {
                (typeof children==="string") ? `- ${children}` : children
            }
        </Text>
    )
}

export function PRenderer({ content }: WithType<RawCVComponentObject, "p">) {
    return (
        <Text style={styles.paragraph}>
            {renderChildren(content, "p")}
        </Text>
    )
}

export function H1Renderer({ content }: WithType<RawCVComponentObject, "h1">) {
    return (
        <Text style={styles.header}>
            {renderChildren(content, "h1")}
        </Text>
    )
}

export function H2Renderer({ content }: WithType<RawCVComponentObject, "h2">) {
    return (
        <Text style={styles.subheader}>
            {renderChildren(content, "h2")}
        </Text>
    )
}

export function H3Renderer({ content }: WithType<RawCVComponentObject, "h3">) {
    return (
        <Text style={styles.subsubheader}>
            {renderChildren(content, "h3")}
        </Text>
    )
}

export function CVRendererAssigner({ cv }: { cv: RawCVComponentObject }): JSX.Element {
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

export function CVDocument({ content }: { content: RawCVObject }) {
    return (
        <Document>
            <Page size="A4" style={
                styles.page
            }>
                {content.map((cv, index) => <CVRendererAssigner key={index} cv={cv} />)}
            </Page>
        </Document>
    )
}