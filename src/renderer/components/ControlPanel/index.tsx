import React, { useMemo, useCallback } from 'react';
import { Formik, FormikHelpers, FormikTouched } from 'formik';
import { Form, Button } from 'react-bootstrap';
import { DesktopCapturerSource } from 'electron';

export interface FormOptions {
    screen?: string,
    ledVertNumber: number,
    ledHorNumber: number,
    vertPadding: number,
    horPadding: number,
};

export interface Props {
    screens?: DesktopCapturerSource[];
    selectedScreenId?: string;
    initialLedVertNumber: number;
    initialLedHorNumber: number;
    initialHorPadding: number,
    initialVertPadding: number,
    onUpdateOptions: (values: FormOptions) => void;
};

export default function ControlPanel({
    screens,
    selectedScreenId,
    initialLedVertNumber = 12,
    initialLedHorNumber = 12,
    initialHorPadding = 0,
    initialVertPadding = 0,
    onUpdateOptions,
}: Props) {
    const screenOptions = useMemo(() => {
        return screens.map(screen => <option key={screen.id} value={screen.id}>{screen.name}</option>)
    }, [screens]);

    const initialValues = useMemo(
        (): FormOptions => ({
            screen: selectedScreenId,
            ledVertNumber: initialLedVertNumber,
            ledHorNumber: initialLedHorNumber,
            vertPadding: initialVertPadding,
            horPadding: initialHorPadding,
        }),
        []
    );

    const handleOptionsUpdating = useCallback((values, { setSubmitting, setTouched }: FormikHelpers<any>) => {
        onUpdateOptions(values);
        setSubmitting(false);
        setTouched({
            screen: false,
            ledHorNumber: false,
            ledVertNumber: false,
            horPadding: false,
            vertPadding: false,
        });
    }, [onUpdateOptions]);

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleOptionsUpdating}
        >
            {
                ({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group controlId="formScreen">
                            <Form.Label>Selected screen</Form.Label>
                            <Form.Control
                                name="screen"
                                as="select"
                                value={values.screen}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isValid={touched.screen && !errors.screen}
                            >
                                {screenOptions}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid" tooltip>
                                {errors.screen}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="formLedHorNumber">
                            <Form.Label>LED horizontal number</Form.Label>
                            <Form.Control
                                type="number"
                                name="ledHorNumber"
                                min={0}
                                value={values.ledHorNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isValid={touched.ledHorNumber && !errors.ledHorNumber}
                            />
                            <Form.Control.Feedback type="invalid" tooltip>
                                {errors.ledHorNumber}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="formLedVertNumber">
                            <Form.Label>LED vertical number</Form.Label>
                            <Form.Control
                                type="number"
                                name="ledVertNumber"
                                min={0}
                                value={values.ledVertNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isValid={touched.ledVertNumber && !errors.ledVertNumber}
                            />
                            <Form.Control.Feedback type="invalid" tooltip>
                                {errors.ledVertNumber}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="formHorPadding">
                            <Form.Label>LED horizontal padding</Form.Label>
                            <Form.Control
                                type="range"
                                name="horPadding"
                                min={5}
                                max={100}
                                value={values.horPadding}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isValid={touched.horPadding && !errors.horPadding}
                            />
                            <Form.Control.Feedback type="invalid" tooltip>
                                {errors.horPadding}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="formVertPadding">
                            <Form.Label>LED vertical padding</Form.Label>
                            <Form.Control
                                type="range"
                                name="vertPadding"
                                min={5}
                                max={100}
                                value={values.vertPadding}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isValid={touched.vertPadding && !errors.vertPadding}
                            />
                            <Form.Control.Feedback type="invalid" tooltip>
                                {errors.vertPadding}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            Save
                        </Button>
                    </Form>
                )
            }
        </Formik>
    );
}