import {z} from 'zod'

const emailSchema = z
    .string({message:'문자열이어야 합니다.'})
    .trim()
    .min(1, {message:'이메일을 입력해주세요'})

const passwordSchema = z
    .string({message:'문자열이어야 합니다.'})
    .min(1, {message:"비밀번호를 입력해주세요"})
    .min(8, {message:"비밀번호는 최소 8자 이상이어야 합니다."})
    .max(15, {message:"비밀번호는 15자 이하로 입력해주세요."})

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})