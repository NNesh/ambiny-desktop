import React, { useMemo, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Form,  } from 'react-bootstrap';
import { DesktopCapturerSource } from 'electron';
import { PortInfo } from 'serialport';
import { LEDOptions, PortOptions, ScreenOptions } from '../../classes/types';

export type FormOptions = ScreenOptions & LEDOptions & PortOptions;

export interface Props {
    screens?: DesktopCapturerSource[];
    initialValues: FormOptions;
    availablePorts: PortInfo[];
    onUpdateOptions: (values: FormOptions) => void;
};


export default function ControlPanel({
    screens,
    initialValues,
    availablePorts,
    onUpdateOptions,
}: Props) {
    const screenOptions = useMemo(() => {
        return screens.map(screen => <option key={screen.id} value={screen.id}>{screen.name}</option>)
    }, [screens]);

    const portsOptions = useMemo(() => {
        return availablePorts.map(port => <option key={port.path} value={port.path}>{port.path}</option>)
    }, [availablePorts]);

    const validate = useCallback((values: FormOptions) => {
        const errors: any = {};

        if (values.horizontalNumber < 1) {
            errors.horizontalNumber = 'LED count should be positive';
        }

        if (values.verticalNumber < 1) {
            errors.verticalNumber = 'LED count should be positive';
        }

        return errors;
    }, []);

    const handleOptionsUpdating = useCallback((values, { setSubmitting, setTouched }: FormikHelpers<any>) => {
        onUpdateOptions(values);
        setSubmitting(false);
        setTouched({
            screen: false,
            ledHorNumber: false,
            ledVertNumber: false,
            horPadding: false,
            vertPadding: false,
            port: false,
        });
    }, [onUpdateOptions]);

    const renderForm = useCallback((options: FormikProps<FormOptions>) => {
        const {
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            // isSubmitting,
        } = options;

        const submitButtonRef = useRef<HTMLButtonElement>();
        const debouncedSubmit = useMemo(() => debounce(() => submitButtonRef.current?.click(), 750), [submitButtonRef?.current]);

        const customChangeHandler = useCallback((e: React.ChangeEvent<any>) => {
            debouncedSubmit();
            return handleChange(e);
        }, [debouncedSubmit]);

        return (
            <Form noValidate onSubmit={handleSubmit}>
                <h3>Options</h3>
                <Form.Group controlId="formScreen">
                    <Form.Label>Selected screen</Form.Label>
                    <Form.Control
                        name="screenId"
                        as="select"
                        value={values.screenId}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.screenId}
                        custom
                    >
                        {screenOptions}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {errors.screenId}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formLedHorNumber">
                    <Form.Label>LED horizontal number</Form.Label>
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
                    <Form.Label>LED vertical number</Form.Label>
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
                    <Form.Label>LED horizontal padding</Form.Label>
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
                    <Form.Label>LED vertical padding</Form.Label>
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
                    <Form.Label>Port</Form.Label>
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
                <button ref={submitButtonRef} className="hidden" type="submit"></button>
            </Form>
        )
    }, [screenOptions, portsOptions]);

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleOptionsUpdating}
            validate={validate}
            enableReinitialize
        >
            {renderForm}
        </Formik>
    );
}