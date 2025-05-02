import { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import {
  createMemberSchema,
  createVesiosuuskuntaSchema,
} from '~/shared/zodSchemas';
import handleError from '~/utils/handleError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MUTATION_AND_QUERY_KEYS } from '~/utils/utils';
import { useRouter } from 'next/router';
import axios from 'axios';

type Form = {
  firstName: string;
  lastName: string;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
  phoneNumber?: string;
  email: string;
  paid?: string;
  conncetionPointNumber?: string;
};

const EMPTY_FORM_DATA: Form = {
  firstName: '',
  lastName: '',
  email: '',
  streetAddress: '',
  zipCode: '',
  city: '',
  paid: '',
  conncetionPointNumber: '',
  phoneNumber: '',
};

const EMPTY_FORM_ERRORS = {
  firstName: '',
  lastName: '',
  email: '',
  streetAddress: '',
  zipCode: '',
  city: '',
  paid: '',
  conncetionPointNumber: '',
  phoneNumber: '',
};

export default function CreateMemberModal({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const [formData, setFormData] = useState<Form>(EMPTY_FORM_DATA);
  const [formErrors, setFormErrors] =
    useState<typeof EMPTY_FORM_ERRORS>(EMPTY_FORM_ERRORS);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync } = useMutation({
    mutationKey: MUTATION_AND_QUERY_KEYS.CREATE_MEMBER,
    mutationFn: async () =>
      await axios.post('/api/vesiosuuskunta/members', formData),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setFormErrors(EMPTY_FORM_ERRORS);
      if (!checkFields()) {
        return;
      }
      await mutateAsync();
    } catch (e) {
      handleError(e);
    }
  }
  function checkFields(): boolean {
    const formParse = createMemberSchema.safeParse(formData);

    if (formParse.success === false) {
      setFormErrors({
        firstName: formParse.error.format().firstName?._errors[0] || '',
        lastName: formParse.error.format().lastName?._errors[0] || '',
        email: formParse.error.format().email?._errors[0] || '',
        city: formParse.error.format().city?._errors[0] || '',
        streetAddress: formParse.error.format().streetAddress?._errors[0] || '',
        zipCode: formParse.error.format().zipCode?._errors[0] || '',
        paid: formParse.error.format().paid?._errors[0] || '',
        conncetionPointNumber:
          formParse.error.format().connectionPointNumber?._errors[0] || '',
        phoneNumber: formParse.error.format().phoneNumber?._errors[0] || '',
      });
      return false;
    }
    return true;
  }

  return (
    <div>
      <div className="fixed top-0 left-0 z-99 h-full w-full bg-black opacity-80"></div>

      <div className="relative grid w-full justify-items-center">
        <div className="absolute z-100 flex flex-col rounded-lg border-4 border-yellow-800 bg-gray-500">
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
              <div className="col-start-1 col-end-1">
                <FirstNameBlock
                  setFormData={setFormData}
                  formData={formData}
                  formErrors={formErrors}
                ></FirstNameBlock>
              </div>
              <div className="col-start-2 col-end-2 ml-5">
                <LastNameBlock
                  setFormData={setFormData}
                  formData={formData}
                  formErrors={formErrors}
                ></LastNameBlock>
              </div>
            </div>
            <div className="m-1 grid justify-center">
              <div className="col-start-1 col-end-1">
                <EmailBlock
                  setFormData={setFormData}
                  formData={formData}
                  formErrors={formErrors}
                ></EmailBlock>
              </div>
              <div className="col-start-2 col-end-2 ml-5">
                <div className="m-1 grid justify-center">
                  <PhoneNumberBlock
                    setFormData={setFormData}
                    formData={formData}
                    formErrors={formErrors}
                  ></PhoneNumberBlock>
                </div>
              </div>
            </div>
            <div className="grid justify-center">
              <div className="col-start-1 col-end-1">
                <StreetAddressBlock
                  setFormData={setFormData}
                  formData={formData}
                  formErrors={formErrors}
                ></StreetAddressBlock>
              </div>
              <div className="col-start-2 col-end-2 ml-5">
                <ZipCodeBlock
                  setFormData={setFormData}
                  formData={formData}
                  formErrors={formErrors}
                ></ZipCodeBlock>
              </div>
              <div className="col-start-1 col-end-1 mt-2">
                <CityBlock
                  setFormData={setFormData}
                  formData={formData}
                  formErrors={formErrors}
                ></CityBlock>
              </div>
            </div>
            <div className="mt-5 mb-5 flex justify-center">
              <Button type="submit" className="w-72 min-w-72">
                Luo jäsen
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

function FirstNameBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
      <label htmlFor="firstName" className="mr-2">
        Etunimi: <span className="text-red-400">*</span>
      </label>
      <Input
        name="firstName"
        className="m-0"
        placeholder="Matti"
        value={formData.firstName}
        onChange={(e) => {
          setFormData((prevData) => ({
            ...prevData,
            firstName: e.target.value,
          }));
        }}
      />
      <ErrorText text={formErrors.firstName} />
    </div>
  );
}

function LastNameBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
      <label htmlFor="lastName" className="mr-2">
        Sukunimi: <span className="text-red-400">*</span>
      </label>
      <Input
        name="lastName"
        className="m-0"
        placeholder="Meikäläinen"
        value={formData.lastName}
        onChange={(e) => {
          setFormData((prevData) => ({
            ...prevData,
            lastName: e.target.value,
          }));
        }}
      />
      <ErrorText text={formErrors.lastName} />
    </div>
  );
}

function StreetAddressBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
      <label className="mr-2" htmlFor="streetAddress">
        Katuosoite:
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
  );
}

function ZipCodeBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
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
  );
}

function CityBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
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
  );
}

function PhoneNumberBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
      <label className="mr-2" htmlFor="phoneNumber">
        Puhelinnumero:
      </label>
      <Input
        name="phoneNumber"
        className="m-0"
        placeholder="045 678 0912"
        value={formData.phoneNumber}
        onChange={(e) => {
          setFormData((prevData) => ({
            ...prevData,
            phoneNumber: e.target.value,
          }));
        }}
      />
      <ErrorText text={formErrors.phoneNumber} />
    </div>
  );
}

function EmailBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
      <label className="mr-2" htmlFor="email">
        Sähköposti: <span className="text-red-400">*</span>
      </label>
      <Input
        name="email"
        className="m-0"
        placeholder="matti.meikalainen@email.com"
        value={formData.email}
        onChange={(e) => {
          setFormData((prevData) => ({
            ...prevData,
            email: e.target.value,
          }));
        }}
      />
      <ErrorText text={formErrors.email} />
    </div>
  );
}
