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

require File.dirname(__FILE__) + '/../test_helper'
require 'info_controller'

# Re-raise errors caught by the controller.
class InfoController; def rescue_action(e) raise e end; end

class InfoControllerTest < Test::Unit::TestCase
  def setup
    @controller = InfoController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
end
