import React, { useMemo, useCallback } from 'react';
import { Formik } from 'formik';
import { Form, Button } from 'react-bootstrap';
import { DesktopCapturerSource } from 'electron';

export interface FormOptions {
    screen?: string,
};

export interface Props {
    screens?: DesktopCapturerSource[];
    selectedScreenId?: string;
    onUpdateOptions: (values: FormOptions) => void;
};

export default function ControlPanel({
    screens,
    selectedScreenId,
    onUpdateOptions,
}: Props) {
    const screenOptions = useMemo(() => {
        return screens.map(screen => <option key={screen.id} value={screen.id}>{screen.name}</option>)
    }, [screens]);

    const initialValues = useMemo(
        (): FormOptions => ({
            screen: selectedScreenId
        }),
        []
    );

    const handleOptionsUpdating = useCallback((values, { setSubmitting }) => {
        onUpdateOptions(values);
        console.log(values);
        setSubmitting(false);
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
                                isValid={touched.screen && !errors.screen}
                            >
                                {screenOptions}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid" tooltip>
                                {errors.screen}
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