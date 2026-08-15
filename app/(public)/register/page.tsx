import RegistrationForm from '@/components/contents/register/RegistrationForm';

const RegisterPage = () => {
  return (
    <section id="register" aria-labelledby="register" aria-label='Registration form' 
      className="flex flex-col flex-1 items-center justify-center h-[100vh-3rem]">
      <RegistrationForm type="register" />
    </section>
  )
}

export default RegisterPage;