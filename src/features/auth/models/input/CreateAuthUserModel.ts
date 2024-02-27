
export type CreateAuthUserPassModel = {
    accountData: {
        login: string,
        email: string,
        createdAt: string,
        passwordHash: string,
        passwordSalt: string
    }
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        resendingCode: Date,
        isConfirmed: boolean
    }
}


