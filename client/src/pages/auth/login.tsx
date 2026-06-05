import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import PasswordInput from "@/components/password-input"
import type { LoginFormValues } from "@/types/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { loginSchema } from "@/types/auth"
import { Link, useNavigate } from "react-router-dom"
import { LoadingSwap } from "@/components/loading-swap"
import { loginApi } from "@/api/auth"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

export function Login({ className, ...props }: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

  const { saveAuth } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const { token, user } = await loginApi(data)
      saveAuth(token, user)
      toast.success("Logged in successfully!")
      navigate("/")
    } catch (err: any) {
      const message = err.response?.data?.message
      setError("root", { message: err.error.message });

      toast.error(message || "Invalid email or password")
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <PasswordInput
                  id="password"
                  required
                  placeholder="Enter Your Password"
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <Button type="submit">
                  <LoadingSwap isLoading={isSubmitting}>Login</LoadingSwap>
                </Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link to="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
