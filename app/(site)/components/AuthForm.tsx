'use client';

import { useCallback, useEffect, useState } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { BsGithub, BsGoogle } from 'react-icons/bs';
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Input from "@/app/components/inputs/Input";
import Button from "@/app/components/Button";

import AuthSocialButton from "./AuthSocialButton";


type Variant = 'LOGIN' | 'REGISTER';

//*! 
const AuthForm = () => {

  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.status === 'authenticated') {
      router.push('/users');
    }
  }, [session?.status, router])

  const toggleVariant = useCallback(() => {
    if (variant === 'LOGIN') {
      setVariant('REGISTER');
    } else {
      setVariant('LOGIN');
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState : {
      errors
    }
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    if (variant === 'REGISTER') {
      axios.post('/api/register', data)
        .then(() => signIn('credentials', data))
        .catch(() => toast.error('Something went wrong'))
        .finally(() => setIsLoading(false));
    }

    if (variant === 'LOGIN') {
      signIn('credentials', {
        ...data,
        redirect: false
      })
      .then((callback) => {
        if (callback?.error) {
          toast.error('Invalid Credentials');
        }

        if (callback?.ok && !callback?.error) {
          toast.success('Success');
          router.push('/users');
        }
      })
      .finally(() => setIsLoading(false));
    }
  };

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error('Invalid Credentials');
        }

        if (callback?.ok && !callback?.error) {
          toast.success('Success');
        }
      })
      .finally(() => setIsLoading(false));
  };
  
  return (
    <section className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {
            variant === 'REGISTER' && (
              <Input 
                label="Name"
                register={register}
                id="name"
                errors={errors} 
                disabled={isLoading}
              /> 
            )
          }
          <Input 
            label="Email"
            register={register}
            id="email"
            errors={errors} 
            type="email"
            disabled={isLoading}
          /> 
          <Input 
            label="Password"
            register={register}
            id="password"
            errors={errors} 
            type="password"
            disabled={isLoading}
          /> 
          <div>
            <Button
              disabled={isLoading}
              fullWidth
              type="submit"
            >
              {
                variant === 'LOGIN' ? 'Sign In' : 'Sign Up'
              }
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
              <div className="absolute flex justify-center text-sm w-full">
                <span className="bg-white px-2 text-gray-500 mx-auto">
                  Or continue with
                </span>
              </div>
            </div>            
          </div>
        </div>

        <div className="mt-12 flex gap-2">
          <AuthSocialButton 
            icon={BsGithub}
            onClick={() => socialAction('github')}
          />
          <AuthSocialButton 
            icon={BsGoogle}
            onClick={() => socialAction('google')}
          />
        </div>

        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {
              variant === 'LOGIN' ? 'New to Messenger?' : 'Already Have an Account?'
            }
          </div>
          <div
            className="underline cursor-pointer"
            onClick={toggleVariant}
          >
            {
              variant === 'LOGIN' ? 'Create an Account' : 'Sign In'
            }
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthForm