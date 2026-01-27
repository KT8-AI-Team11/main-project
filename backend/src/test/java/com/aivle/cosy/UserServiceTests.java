package com.aivle.cosy;

import static org.assertj.core.api.Fail.fail;

import org.junit.jupiter.api.Test;

public class UserServiceTests {

    // actual login/sign up test (아직 db 연결 안해둠)
    @Test
    void testLoginSuccess(){
        fail("Not yet implemented");
    }

    @Test
    void testLoginFailedWithWrongPassword(){
        fail("Not yet implemented");
    }

    @Test
    void testLoginFailedWithWrongEmailAddress(){
        fail("Not yet implemented");
    }

    @Test
    void signUpSuccess(){
        fail("Not yet implemented");
    }

    @Test
    void signUpFailedWithInvalidEmails(){
        fail("Not yet implemented");
    }

    @Test
    void signUpFailedWithInvalidPasswords(){
        fail("Not yet implemented");
    }

    @Test
    void signUpFailedWithUnregisteredDomain(){
        fail("Not yet implemented");
    }

}
