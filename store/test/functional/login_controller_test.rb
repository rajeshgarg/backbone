# Copyright (c) 2006 The Pragmatic Programmers, LLC.
# Reproduced from the book "Agile Web Development with Rails, 2nd Ed.",
# published by The Pragmatic Bookshelf.
# Available from www.pragmaticprogrammer.com/titles/rails2
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this source code (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
# 
# 1) This Software cannot be used in any training course or seminar, whether
# presented live, via video, audio, screencast, or any other media, without
# explicit prior permission from the publisher.
# 
# 2) The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE. 

#START:original
require File.dirname(__FILE__) + '/../test_helper'
require 'login_controller'

# Re-raise errors caught by the controller.
class LoginController; def rescue_action(e) raise e end; end

class LoginControllerTest < Test::Unit::TestCase
#END:original

  fixtures :users
  
#START:original
  def setup
    @controller = LoginController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
#END:original
  
  if false
    #START:index
    def test_index 
      get :index 
      assert_response :success 
    end
    #END:index
  end

  #START:index_without_user
  def test_index_without_user
    get :index
    assert_redirected_to :action => "login"
    assert_equal "Please log in", flash[:notice]
  end
  #END:index_without_user

  #START:index_with_user
  def test_index_with_user
    get :index, {}, { :user_id => users(:dave).id }
    assert_response :success
    assert_template "index"
  end
  #END:index_with_user
 
  #START:test_login
  def test_login
    dave = users(:dave)
    post :login, :name => dave.name, :password => 'secret'
    assert_redirected_to :action => "index"
    assert_equal dave.id, session[:user_id]
  end
  #END:test_login

  #START:test_bad_password
  def test_bad_password
    dave = users(:dave)
    post :login, :name => dave.name, :password => 'wrong'
    assert_template "login"
    assert_equal "Invalid user/password combination", flash[:notice]
  end
  #END:test_bad_password
#START:original
end
#END:original
