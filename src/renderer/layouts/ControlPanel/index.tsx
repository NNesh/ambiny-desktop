import React, { useMemo, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Form, Button } from 'react-bootstrap';
import { PortInfo } from 'serialport';
import { useIntl, defineMessages } from 'react-intl';
import { LEDOptions, PortOptions, ScreenOptions, ScreenResolution } from '../../classes/types';
import Source from '../../classes/Source';
import ResolutionField from '../../components/ResolutionField';
import './ControlPanel.less';

export type FormOptions = ScreenOptions & LEDOptions & PortOptions;

export interface Props {
    resolutions: ScreenResolution[];
    sources?: Source[];
    initialValues: FormOptions;
    availablePorts: PortInfo[];
    onUpdateOptions: (values: FormOptions) => void;
    onConnect: () => void;
    connected?: boolean;
};

const baudRates = [115200, 57600, 38400, 19200, 9600];

const messages = defineMessages({
    selectedScreen: {
        id: 'selected-screen',
        defaultMessage: 'Selected screen',
    },
    options: {
        id: 'options',
        defaultMessages: 'Options',
    },
    maxResolution: {
        id: 'max-res',
        defaultMessage: 'Maximum resolution',
    },
    framerate: {
        id: 'framerate',
        defaultMessage: 'Framerate',
    },
    ledHorNumber: {
        id: 'led-hor-number',
        defaultMessage: 'Amount of horizontal LEDs',
    },
    ledVertNumber: {
        id: 'led-vert-number',
        defaultMessage: 'Amount of vertical LEDs',
    },
    ledHorPadding: {
        id: 'led-hor-padding',
        defaultMessage: 'Padding for horizontal LEDs',
    },
    ledVertPadding: {
        id: 'led-vert-padding',
        defaultMessage: 'Padding for vertical LEDs',
    },
    port: {
        id: 'port-number',
        defaultMessage: 'Port number',
    },
    portSpeed: {
        id: 'port-speed',
        defaultMessage: 'Baud rate',
    },
    connect: {
        id: 'connect',
        defaultMessage: 'connect',
    },
    errorLedCount: {
        id: 'error-form-led-count',
        defaultMessage: 'LED count should be positive',
    },
    errorFramerateValue: {
        id: 'error-form-framerate',
        defaultMessage: 'Frame rate should be positive',
    },
});

export default function ControlPanel({
    resolutions,
    sources,
    initialValues,
    availablePorts,
    onUpdateOptions,
    onConnect,
    connected = false,
}: Props) {
    const { formatMessage } = useIntl();

    const sourcesOptions = useMemo(() => {
        return sources.map(source => <option key={source.getId()} value={source.getId()}>{source.getName()}</option>)
    }, [sources]);

    const portsOptions = useMemo(() => {
        return availablePorts.map(port => <option key={port.path} value={port.path}>{port.path}</option>)
    }, [availablePorts]);

    const baudRateOptions = useMemo(() => {
        return baudRates.map(baudRate => <option key={baudRate} value={baudRate}>{baudRate}</option>)
    }, [baudRates]);

    const validate = useCallback((values: FormOptions) => {
        const errors: any = {};

        if (values.horizontalNumber < 1) {
            errors.horizontalNumber = formatMessage(messages.errorLedCount);
        }

        if (values.verticalNumber < 1) {
            errors.verticalNumber = formatMessage(messages.errorLedCount);
        }

        if (values.frameRate < 1) {
            errors.frameRate = formatMessage(messages.errorFramerateValue);
        }

        return errors;
    }, [formatMessage]);

    const handleOptionsUpdating = useCallback((values, { setSubmitting, setTouched }: FormikHelpers<FormOptions>) => {
        onUpdateOptions(values);
        setSubmitting(false);
    }, [onUpdateOptions]);

    const renderForm = useCallback((options: FormikProps<FormOptions>) => {
        const {
            values,
            errors,
            // touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            setFieldTouched,
            // isSubmitting,
        } = options;

        const submitButtonRef = useRef<HTMLButtonElement>();
        const debouncedSubmit = useMemo(() => debounce(() => submitButtonRef.current?.click(), 750), [submitButtonRef?.current]);

        const customChangeHandler = useCallback((e: React.ChangeEvent<any>) => {
            debouncedSubmit();
            return handleChange(e);
        }, [debouncedSubmit]);

        const handleChangeResolution = useCallback((name: string, resolution: ScreenResolution) => {
            setFieldValue(name, resolution);
            setFieldTouched(name, true);
            debouncedSubmit();
        }, [debouncedSubmit, setFieldValue]);

        return (
            <Form noValidate onSubmit={handleSubmit}>
                <h3>{formatMessage(messages.options)}</h3>
                <Form.Group controlId="formScreen">
                    <Form.Label>{formatMessage(messages.selectedScreen)}</Form.Label>
                    <Form.Control
                        name="sourceId"
                        as="select"
                        value={values.sourceId}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.sourceId}
                        custom
                    >
                        {sourcesOptions}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {errors.sourceId}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formResolution">
                    <Form.Label>{formatMessage(messages.maxResolution)}</Form.Label>
                    <ResolutionField
                        name="resolution"
                        onChange={handleChangeResolution}
                        options={resolutions}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.resolution}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formFrameRate">
                    <Form.Label>{formatMessage(messages.framerate)}</Form.Label>
                    <Form.Control
                        type="number"
                        name="frameRate"
                        min={0}
                        value={values.frameRate}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.frameRate}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.frameRate}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formLedHorNumber">
                    <Form.Label>{formatMessage(messages.ledHorNumber)}</Form.Label>
                    <Form.Control
                        type="number"
                        name="horizontalNumber"
                        min={0}
                        value={values.horizontalNumber}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.horizontalNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.horizontalNumber}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formLedVertNumber">
                    <Form.Label>{formatMessage(messages.ledVertNumber)}</Form.Label>
                    <Form.Control
                        type="number"
                        name="verticalNumber"
                        min={0}
                        value={values.verticalNumber}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.verticalNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.verticalNumber}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formHorPadding">
                    <Form.Label>{formatMessage(messages.ledHorPadding)}</Form.Label>
                    <Form.Control
                        type="range"
                        name="horizontalPadding"
                        min={5}
                        max={100}
                        value={values.horizontalPadding}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.horizontalPadding}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.horizontalPadding}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formVertPadding">
                    <Form.Label>{formatMessage(messages.ledVertPadding)}</Form.Label>
                    <Form.Control
                        type="range"
                        name="verticalPadding"
                        min={5}
                        max={100}
                        value={values.verticalPadding}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.verticalPadding}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.verticalPadding}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formPort">
                    <Form.Label>{formatMessage(messages.port)}</Form.Label>
                    <Form.Control
                        name="port"
                        as="select"
                        value={values.port}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.port}
                        custom
                    >
                        {portsOptions}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {errors.port}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formBaudRate">
                    <Form.Label>{formatMessage(messages.portSpeed)}</Form.Label>
                    <Form.Control
                        name="baudRate"
                        as="select"
                        type="number"
                        value={values.baudRate}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.baudRate}
                        custom
                    >
                        {baudRateOptions}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {errors.baudRate}
                    </Form.Control.Feedback>
                </Form.Group>
                <Button type="button" onClick={onConnect} disabled={connected}>
                    {formatMessage(messages.connect)}
                </Button>
                <button ref={submitButtonRef} className="hidden" type="submit"></button>
            </Form>
        )
    }, [sourcesOptions, portsOptions, resolutions, onConnect, connected]);

    return (
        <div className="ControlPanel">
            <Formik
                initialValues={initialValues}
                onSubmit={handleOptionsUpdating}
                validate={validate}
                enableReinitialize
            >
                {renderForm}
            </Formik>
        </div>
    );
}