import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export type RawCVComponentObject = {
    type: "bullet" | "p" | "h1" | "h2" | "h3" | "div"
    content: RawCVComponentChildren
}
// For bullet points, schema expects string with newline for seperating into bullet points

export type RawCVComponentChildren = string | (RawCVComponentObject[])

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

function renderChildren(children: RawCVComponentChildren) {
    if (typeof children === "string") {
        return children;
    } else {
        return children.map((child, index) => <CVRendererAssigner key={index} cv={child} />)
    }
}

export function BulletRenderer({ content }: WithType<RawCVComponentObject, "bullet">) {
    return (
        <Text style={styles.paragraph}>
            {
                Array.isArray(content) ? content.map((child, index) => <CVRendererAssigner key={index} cv={child} />) : (
                    // Split on newlines
                    content.split("\n").map((point: string, index)=>(
                        <Text key={index}>{`• ${point}\n`}</Text>
                    ))
                )
            }
        </Text>
    )
}

export function PRenderer({ content }: WithType<RawCVComponentObject, "p">) {
    return (
        <Text style={styles.paragraph}>
            {renderChildren(content)}
        </Text>
    )
}

export function H1Renderer({ content }: WithType<RawCVComponentObject, "h1">) {
    return (
        <Text style={styles.header}>
            {renderChildren(content)}
        </Text>
    )
}

export function H2Renderer({ content }: WithType<RawCVComponentObject, "h2">) {
    return (
        <Text style={styles.subheader}>
            {renderChildren(content)}
        </Text>
    )
}

export function H3Renderer({ content }: WithType<RawCVComponentObject, "h3">) {
    return (
        <Text style={styles.subsubheader}>
            {renderChildren(content)}
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