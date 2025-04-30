import { FormEvent, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { createVesiosuuskuntaSchema } from '~/shared/zodSchemas';
import handleError from '~/utils/handleError';

export default function CreateVesiosuuskuntaModal({
  closeModal,
}: {
  closeModal: () => void;
}) {
  type Form = {
    name: string;
    streetAddress?: string;
    zipCode?: string;
    city?: string;
  };

  const EMPTY_FORM_DATA: Form = {
    name: '',
    streetAddress: '',
    zipCode: '',
    city: '',
  };

  const EMPTY_FORM_ERRORS = {
    name: '',
    streetAddress: '',
    zipCode: '',
    city: '',
  };

  const [formData, setFormData] = useState<Form>(EMPTY_FORM_DATA);
  const [formErrors, setFormErrors] =
    useState<typeof EMPTY_FORM_ERRORS>(EMPTY_FORM_ERRORS);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      checkFields();
    } catch (e) {
      handleError(e);
    }
  }
  function checkFields() {
    const formParse = createVesiosuuskuntaSchema.safeParse(formData);

    if (formParse.success === false) {
      setFormErrors({
        name: formParse.error.format().name?._errors[0] || '',
        city: formParse.error.format().city?._errors[0] || '',
        streetAddress: formParse.error.format().streetAddress?._errors[0] || '',
        zipCode: formParse.error.format().zipCode?._errors[0] || '',
      });
      return;
    }
    //setFormErrors(() => ({ firstName, lastName, email, password }));

    // if some of the fields has failed, return false
    /*
    if (firstName || lastName || email || password) {
      return false;
    }
    */
    return true;
  }

  return (
    <div>
      <div className="absolute top-0 left-0 z-99 h-screen w-full bg-black opacity-80"></div>

      <div className="relative grid w-full justify-items-center">
        <div className="absolute z-100 flex w-screen flex-col rounded-lg border-4 border-yellow-800 bg-gray-500 md:w-100">
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div className="flex justify-end">
              <button
                className="mt-2 mr-2 hover:text-blue-300"
                onClick={() => closeModal()}
                type="button"
              >
                Sulje
              </button>
            </div>
            <div className="m-1 grid justify-center">
              <label htmlFor="name" className="mr-2">
                Nimi: <span className="text-red-400">Pakollinen</span>
              </label>
              <Input
                name="name"
                className="m-0"
                placeholder="Meikäläisen vesiosuuskunta"
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    name: e.target.value,
                  }));
                }}
              />
              <ErrorText text={formErrors.name} />
            </div>
            <div className="m-1 grid justify-center">
              <label className="mr-2" htmlFor="streetAddress">
                Osoite:
              </label>
              <Input
                name="streetAddress"
                className="m-0"
                placeholder="Mannerheimintie 30"
                value={formData.streetAddress}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    streetAddress: e.target.value,
                  }));
                }}
              />
              <ErrorText text={formErrors.streetAddress} />
            </div>
            <div className="m-1 grid justify-center">
              <label htmlFor="zipCode" className="mr-2">
                Postinumero:
              </label>
              <Input
                name="zipCode"
                className="m-0"
                placeholder="00100"
                type="number"
                value={formData.zipCode}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    zipCode: e.target.value,
                  }));
                }}
              />
              <ErrorText text={formErrors.zipCode} />
            </div>
            <div className="m-1 mb-5 grid justify-center">
              <label className="mr-2" htmlFor="city">
                Postitoimipaikka:
              </label>
              <Input
                name="city"
                className="m-0"
                placeholder="Helsinki"
                value={formData.city}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    city: e.target.value,
                  }));
                }}
              />
              <ErrorText text={formErrors.city} />
            </div>
            <div className="mt-5 mb-5 flex justify-center">
              <Button type="submit" className="w-72 min-w-72">
                Luo vesiosuuskunta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ErrorText({ text }: { text: string }) {
  if (text.length > 0) {
    return <p className="text-red-500">{text}</p>;
  }
  return null;
}
